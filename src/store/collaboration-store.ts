import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APIService } from '@/lib/api';
import { 
  CollaborationState, 
  CollaborativeSession, 
  DocumentEdit, 
  DocumentVersion, 
  DocumentLock, 
  UserPresence, 
  DocumentComment,
  EditType 
} from '@/types';

interface CollaborationStore extends CollaborationState {
  // Real-time collaboration actions
  initializeSession: (documentId: string) => Promise<void>;
  joinSession: (documentId: string, userId: string, userName: string) => void;
  leaveSession: (documentId: string, userId: string) => void;
  
  // Document editing
  applyEdit: (documentId: string, edit: Omit<DocumentEdit, 'id' | 'timestamp'>) => Promise<void>;
  undoEdit: (documentId: string, editId: string) => Promise<void>;
  
  // Version management
  createVersion: (documentId: string, content: string, changesSummary: string, isMajor?: boolean) => Promise<DocumentVersion>;
  loadVersionHistory: (documentId: string) => Promise<DocumentVersion[]>;
  restoreVersion: (documentId: string, versionId: string) => Promise<void>;
  
  // Document locking
  acquireLock: (documentId: string, section?: string) => Promise<boolean>;
  releaseLock: (documentId: string) => Promise<void>;
  checkLock: (documentId: string) => Promise<DocumentLock | null>;
  
  // Comments and annotations
  addComment: (documentId: string, comment: Omit<DocumentComment, '_id' | '_uid' | '_tid' | 'created_at'>) => Promise<DocumentComment>;
  replyToComment: (commentId: string, reply: string) => Promise<DocumentComment>;
  resolveComment: (commentId: string) => Promise<void>;
  loadComments: (documentId: string) => Promise<DocumentComment[]>;
  
  // User presence
  updatePresence: (documentId: string, userId: string, presence: Partial<UserPresence>) => void;
  getActiveUsers: (documentId: string) => UserPresence[];
  
  // Conflict resolution
  resolveConflict: (documentId: string, resolution: 'manual' | 'auto_merge' | 'last_write_wins') => void;
  mergeEdits: (documentId: string, edits: DocumentEdit[]) => string;
  
  // Utility methods
  clearSession: (documentId: string) => void;
  syncDocument: (documentId: string) => Promise<void>;
  
  // Notification callbacks
  onEditReceived?: (edit: DocumentEdit) => void;
  onUserJoined?: (presence: UserPresence) => void;
  onUserLeft?: (userId: string) => void;
  onCommentAdded?: (comment: DocumentComment) => void;
  onLockAcquired?: (lock: DocumentLock) => void;
  onLockReleased?: (documentId: string) => void;
}

export const useCollaborationStore = create<CollaborationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      activeSessions: new Map(),
      documentVersions: new Map(),
      documentLocks: new Map(),
      userPresence: new Map(),
      comments: new Map(),
      pendingEdits: new Map(),
      conflictResolution: 'auto_merge',

      // Session management
      initializeSession: async (documentId: string) => {
        try {
          // Load existing session data
          const [versions, comments, locks, edits] = await Promise.all([
            get().loadVersionHistory(documentId),
            get().loadComments(documentId),
            get().checkLock(documentId),
            APIService.getDocumentEdits(documentId)
          ]);

          const session: CollaborativeSession = {
            id: documentId,
            document_id: documentId,
            participants: [],
            active_edits: edits,
            current_version: versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 1,
            last_sync: Date.now(),
            conflict_resolution: get().conflictResolution
          };

          set(state => ({
            activeSessions: new Map(state.activeSessions.set(documentId, session)),
            documentVersions: new Map(state.documentVersions.set(documentId, versions)),
            comments: new Map(state.comments.set(documentId, comments)),
            documentLocks: locks ? new Map(state.documentLocks.set(documentId, locks)) : state.documentLocks
          }));
        } catch (error) {
          console.error('Failed to initialize collaboration session:', error);
        }
      },

      joinSession: (documentId: string, userId: string, userName: string) => {
        const presence: UserPresence = {
          user_id: userId,
          user_name: userName,
          document_id: documentId,
          cursor_position: 0,
          last_active: Date.now(),
          is_editing: false
        };

        set(state => {
          const session = state.activeSessions.get(documentId);
          if (session) {
            const updatedParticipants = session.participants.filter(p => p.user_id !== userId);
            updatedParticipants.push(presence);
            
            const updatedSession = { ...session, participants: updatedParticipants };
            const newSessions = new Map(state.activeSessions);
            newSessions.set(documentId, updatedSession);
            
            return {
              activeSessions: newSessions,
              userPresence: new Map(state.userPresence.set(`${documentId}-${userId}`, presence))
            };
          }
          return state;
        });

        // Notify listeners
        get().onUserJoined?.(presence);
      },

      leaveSession: (documentId: string, userId: string) => {
        set(state => {
          const session = state.activeSessions.get(documentId);
          if (session) {
            const updatedParticipants = session.participants.filter(p => p.user_id !== userId);
            const updatedSession = { ...session, participants: updatedParticipants };
            const newSessions = new Map(state.activeSessions);
            newSessions.set(documentId, updatedSession);
            
            const newPresence = new Map(state.userPresence);
            newPresence.delete(`${documentId}-${userId}`);
            
            return {
              activeSessions: newSessions,
              userPresence: newPresence
            };
          }
          return state;
        });

        // Notify listeners
        get().onUserLeft?.(userId);
      },

      // Document editing
      applyEdit: async (documentId: string, edit: Omit<DocumentEdit, 'id' | 'timestamp'>) => {
        try {
          const session = get().activeSessions.get(documentId);
          const currentVersion = session?.current_version || 1;
          
          const fullEdit: DocumentEdit = {
            ...edit,
            id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            version: currentVersion
          };

          // Store edit in database
          await APIService.createDocumentEdit(fullEdit);

          // Update local state
          set(state => {
            const session = state.activeSessions.get(documentId);
            if (session) {
              const updatedSession = {
                ...session,
                active_edits: [...session.active_edits, fullEdit],
                last_sync: Date.now()
              };
              return {
                activeSessions: new Map(state.activeSessions.set(documentId, updatedSession))
              };
            }
            return state;
          });

          // Notify listeners
          get().onEditReceived?.(fullEdit);
        } catch (error) {
          console.error('Failed to apply edit:', error);
        }
      },

      undoEdit: async (documentId: string, editId: string) => {
        try {
          // Remove edit from database
          await APIService.deleteDocumentEdit(editId);

          // Update local state
          set(state => {
            const session = state.activeSessions.get(documentId);
            if (session) {
              const updatedSession = {
                ...session,
                active_edits: session.active_edits.filter(edit => edit.id !== editId)
              };
              return {
                activeSessions: new Map(state.activeSessions.set(documentId, updatedSession))
              };
            }
            return state;
          });
        } catch (error) {
          console.error('Failed to undo edit:', error);
        }
      },

      // Version management
      createVersion: async (documentId: string, content: string, changesSummary: string, isMajor = false) => {
        try {
          const session = get().activeSessions.get(documentId);
          const nextVersion = (session?.current_version || 0) + 1;

          const version = await APIService.createDocumentVersion({
            document_id: documentId,
            version: nextVersion,
            content,
            changes_summary: changesSummary,
            is_major: isMajor
          });

          // Update local state
          set(state => {
            const versions = state.documentVersions.get(documentId) || [];
            const updatedVersions = [...versions, version];
            
            const session = state.activeSessions.get(documentId);
            let updatedSessions = state.activeSessions;
            if (session) {
              updatedSessions = new Map(state.activeSessions.set(documentId, {
                ...session,
                current_version: nextVersion
              }));
            }

            return {
              documentVersions: new Map(state.documentVersions.set(documentId, updatedVersions)),
              activeSessions: updatedSessions
            };
          });

          return version;
        } catch (error) {
          console.error('Failed to create version:', error);
          throw error;
        }
      },

      loadVersionHistory: async (documentId: string) => {
        try {
          const versions = await APIService.getDocumentVersions(documentId);
          
          set(state => ({
            documentVersions: new Map(state.documentVersions.set(documentId, versions))
          }));

          return versions;
        } catch (error) {
          console.error('Failed to load version history:', error);
          return [];
        }
      },

      restoreVersion: async (documentId: string, versionId: string) => {
        try {
          const versions = get().documentVersions.get(documentId) || [];
          const version = versions.find(v => v._id === versionId);
          
          if (version) {
            // Create a new version with the restored content
            await get().createVersion(
              documentId, 
              version.content, 
              `Restored from version ${version.version}`,
              true
            );
          }
        } catch (error) {
          console.error('Failed to restore version:', error);
        }
      },

      // Document locking
      acquireLock: async (documentId: string, section?: string) => {
        try {
          const lock = await APIService.acquireDocumentLock(documentId, section);
          
          set(state => ({
            documentLocks: new Map(state.documentLocks.set(documentId, lock))
          }));

          get().onLockAcquired?.(lock);
          return true;
        } catch (error) {
          console.error('Failed to acquire lock:', error);
          return false;
        }
      },

      releaseLock: async (documentId: string) => {
        try {
          await APIService.releaseDocumentLock(documentId);
          
          set(state => {
            const newLocks = new Map(state.documentLocks);
            newLocks.delete(documentId);
            return { documentLocks: newLocks };
          });

          get().onLockReleased?.(documentId);
        } catch (error) {
          console.error('Failed to release lock:', error);
        }
      },

      checkLock: async (documentId: string) => {
        try {
          const lock = await APIService.getDocumentLock(documentId);
          
          if (lock) {
            set(state => ({
              documentLocks: new Map(state.documentLocks.set(documentId, lock))
            }));
          }

          return lock;
        } catch (error) {
          console.error('Failed to check lock:', error);
          return null;
        }
      },

      // Comments and annotations
      addComment: async (documentId: string, comment: Omit<DocumentComment, '_id' | '_uid' | '_tid' | 'created_at'>) => {
        try {
          const newComment = await APIService.createDocumentComment({
            ...comment,
            document_id: documentId,
            created_at: Date.now()
          });

          set(state => {
            const comments = state.comments.get(documentId) || [];
            const updatedComments = [...comments, newComment];
            return {
              comments: new Map(state.comments.set(documentId, updatedComments))
            };
          });

          get().onCommentAdded?.(newComment);
          return newComment;
        } catch (error) {
          console.error('Failed to add comment:', error);
          throw error;
        }
      },

      replyToComment: async (commentId: string, reply: string) => {
        try {
          // Implementation would depend on finding the original comment and creating a reply
          // This is a simplified version
          const originalComment = await APIService.getDocumentComment(commentId);
          if (originalComment) {
            return await get().addComment(originalComment.document_id, {
              document_id: originalComment.document_id,
              content: reply,
              position: originalComment.position,
              selection_text: originalComment.selection_text,
              author_id: originalComment.author_id,
              author_name: originalComment.author_name,
              resolved: false,
              parent_comment_id: commentId,
              thread_id: originalComment.thread_id || commentId
            });
          }
          throw new Error('Original comment not found');
        } catch (error) {
          console.error('Failed to reply to comment:', error);
          throw error;
        }
      },

      resolveComment: async (commentId: string) => {
        try {
          await APIService.resolveDocumentComment(commentId);
          
          // Update local state
          set(state => {
            const newComments = new Map(state.comments);
            for (const [documentId, comments] of newComments.entries()) {
              const updatedComments = comments.map(comment => 
                comment._id === commentId ? { ...comment, resolved: true } : comment
              );
              newComments.set(documentId, updatedComments);
            }
            return { comments: newComments };
          });
        } catch (error) {
          console.error('Failed to resolve comment:', error);
        }
      },

      loadComments: async (documentId: string) => {
        try {
          const comments = await APIService.getDocumentComments(documentId);
          
          set(state => ({
            comments: new Map(state.comments.set(documentId, comments))
          }));

          return comments;
        } catch (error) {
          console.error('Failed to load comments:', error);
          return [];
        }
      },

      // User presence
      updatePresence: (documentId: string, userId: string, presence: Partial<UserPresence>) => {
        set(state => {
          const key = `${documentId}-${userId}`;
          const currentPresence = state.userPresence.get(key);
          
          if (currentPresence) {
            const updatedPresence = { ...currentPresence, ...presence, last_active: Date.now() };
            return {
              userPresence: new Map(state.userPresence.set(key, updatedPresence))
            };
          }
          return state;
        });
      },

      getActiveUsers: (documentId: string) => {
        const presenceMap = get().userPresence;
        const activeUsers: UserPresence[] = [];
        
        for (const [key, presence] of presenceMap.entries()) {
          if (key.startsWith(`${documentId}-`)) {
            // Consider user active if last activity was within 5 minutes
            if (Date.now() - presence.last_active < 5 * 60 * 1000) {
              activeUsers.push(presence);
            }
          }
        }
        
        return activeUsers;
      },

      // Conflict resolution
      resolveConflict: (documentId: string, resolution: 'manual' | 'auto_merge' | 'last_write_wins') => {
        set(state => ({
          conflictResolution: resolution
        }));
      },

      mergeEdits: (documentId: string, edits: DocumentEdit[]) => {
        // Simple merge strategy - in a real implementation, this would be more sophisticated
        const sortedEdits = edits.sort((a, b) => a.timestamp - b.timestamp);
        let mergedContent = '';
        
        // This is a simplified merge - real implementation would need conflict resolution
        for (const edit of sortedEdits) {
          if (edit.type === 'insert') {
            mergedContent += edit.content;
          }
        }
        
        return mergedContent;
      },

      // Utility methods
      clearSession: (documentId: string) => {
        set(state => {
          const newSessions = new Map(state.activeSessions);
          const newPresence = new Map(state.userPresence);
          const newComments = new Map(state.comments);
          const newLocks = new Map(state.documentLocks);
          
          newSessions.delete(documentId);
          newComments.delete(documentId);
          newLocks.delete(documentId);
          
          // Remove presence entries for this document
          for (const key of newPresence.keys()) {
            if (key.startsWith(`${documentId}-`)) {
              newPresence.delete(key);
            }
          }
          
          return {
            activeSessions: newSessions,
            userPresence: newPresence,
            comments: newComments,
            documentLocks: newLocks
          };
        });
      },

      syncDocument: async (documentId: string) => {
        try {
          // Re-initialize session to sync latest data
          await get().initializeSession(documentId);
        } catch (error) {
          console.error('Failed to sync document:', error);
        }
      }
    }),
    {
      name: 'collaboration-storage',
      // Only persist non-sensitive data
      partialize: (state) => ({
        conflictResolution: state.conflictResolution
      })
    }
  )
);