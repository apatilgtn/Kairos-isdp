import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCollaborationStore } from '@/store/collaboration-store';
import { useAppStore } from '@/store/app-store';
import { 
  Users, 
  Lock, 
  Unlock, 
  MessageSquare, 
  History, 
  Save, 
  Undo,
  Send,
  CheckCircle,
  Clock,
  Edit3,
  Eye
} from 'lucide-react';
import { RoadmapDocument, DocumentComment, DocumentVersion, UserPresence } from '@/types';

interface CollaborativeEditorProps {
  document: RoadmapDocument;
  onContentChange: (content: string) => void;
  onSave: () => Promise<void>;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  document,
  onContentChange,
  onSave
}) => {
  const { toast } = useToast();
  const { auth } = useAppStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Collaboration store
  const {
    initializeSession,
    joinSession,
    leaveSession,
    applyEdit,
    acquireLock,
    releaseLock,
    checkLock,
    addComment,
    loadComments,
    createVersion,
    loadVersionHistory,
    updatePresence,
    getActiveUsers,
    activeSessions,
    documentLocks,
    comments,
    documentVersions,
    onEditReceived,
    onUserJoined,
    onUserLeft,
    onCommentAdded
  } = useCollaborationStore();

  // Local state
  const [content, setContent] = useState(document.content);
  const [isLocked, setIsLocked] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [documentComments, setDocumentComments] = useState<DocumentComment[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [commentPosition, setCommentPosition] = useState(0);
  const [versionName, setVersionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize collaboration session
  useEffect(() => {
    if (auth.user && document._id) {
      initializeSession(document._id);
      joinSession(document._id, auth.user.uid, auth.user.name);
      loadComments(document._id).then(setDocumentComments);
      loadVersionHistory(document._id).then(setVersions);
      
      return () => {
        leaveSession(document._id, auth.user.uid);
      };
    }
  }, [document._id, auth.user]);

  // Update active users
  useEffect(() => {
    const interval = setInterval(() => {
      const users = getActiveUsers(document._id);
      setActiveUsers(users);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [document._id]);

  // Check document lock status
  useEffect(() => {
    checkLock(document._id).then(lock => {
      setIsLocked(!!lock && lock.locked_by !== auth.user?.uid);
    });
  }, [document._id]);

  // Set up real-time collaboration listeners
  useEffect(() => {
    // Set up the collaboration store callbacks using setState
    useCollaborationStore.setState({
      onEditReceived: (edit) => {
        if (edit.document_id === document._id && edit.user_id !== auth.user?.uid) {
          // Apply edit to content
          const newContent = applyEditToContent(content, edit);
          setContent(newContent);
          onContentChange(newContent);
          
          toast({
            title: 'Document Updated',
            description: `${edit.user_name} made changes`,
            duration: 2000
          });
        }
      },

      onUserJoined: (presence) => {
        if (presence.document_id === document._id) {
          toast({
            title: 'User Joined',
            description: `${presence.user_name} is now editing`,
            duration: 2000
          });
        }
      },

      onUserLeft: (userId) => {
        const user = activeUsers.find(u => u.user_id === userId);
        if (user) {
          toast({
            title: 'User Left',
            description: `${user.user_name} stopped editing`,
            duration: 2000
          });
        }
      },

      onCommentAdded: (comment) => {
        if (comment.document_id === document._id) {
          setDocumentComments(prev => [...prev, comment]);
          toast({
            title: 'New Comment',
            description: `${comment.author_name} added a comment`,
            duration: 3000
          });
        }
      }
    });

    return () => {
      // Clean up by resetting callbacks
      useCollaborationStore.setState({
        onEditReceived: undefined,
        onUserJoined: undefined,
        onUserLeft: undefined,
        onCommentAdded: undefined
      });
    };
  }, [document._id, content, activeUsers, auth.user]);

  // Apply edit to content
  const applyEditToContent = (currentContent: string, edit: any) => {
    switch (edit.type) {
      case 'insert':
        return currentContent.slice(0, edit.position) + edit.content + currentContent.slice(edit.position);
      case 'delete':
        return currentContent.slice(0, edit.position) + currentContent.slice(edit.position + edit.length);
      case 'replace':
        return currentContent.slice(0, edit.position) + edit.content + currentContent.slice(edit.position + edit.length);
      default:
        return currentContent;
    }
  };

  // Handle content changes
  const handleContentChange = useCallback(async (newContent: string) => {
    if (!auth.user || isLocked) return;

    const oldContent = content;
    setContent(newContent);
    onContentChange(newContent);

    // Update presence
    updatePresence(document._id, auth.user.uid, {
      cursor_position: textareaRef.current?.selectionStart || 0,
      is_editing: true
    });

    // Create edit operation
    if (newContent !== oldContent) {
      const edit = {
        document_id: document._id,
        user_id: auth.user.uid,
        user_name: auth.user.name,
        type: 'replace' as const,
        position: 0,
        length: oldContent.length,
        content: newContent,
        version: (activeSessions.get(document._id)?.current_version || 1)
      };

      await applyEdit(document._id, edit);
    }
  }, [content, isLocked, auth.user, document._id]);

  // Handle text selection for comments
  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start !== end) {
      const selected = content.slice(start, end);
      setSelectedText(selected);
      setCommentPosition(start);
    }
  };

  // Lock/unlock document
  const handleToggleLock = async () => {
    try {
      if (isLocked) {
        await releaseLock(document._id);
        setIsLocked(false);
        toast({
          title: 'Document Unlocked',
          description: 'You can now edit this document',
        });
      } else {
        const success = await acquireLock(document._id);
        if (success) {
          setIsLocked(false);
          toast({
            title: 'Document Locked',
            description: 'You have exclusive editing access',
          });
        } else {
          toast({
            title: 'Lock Failed',
            description: 'Another user is currently editing',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Lock Error',
        description: 'Failed to change lock status',
        variant: 'destructive'
      });
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!auth.user || !newComment.trim()) return;

    try {
      await addComment(document._id, {
        document_id: document._id,
        author_id: auth.user.uid,
        author_name: auth.user.name,
        content: newComment,
        position: commentPosition,
        selection_text: selectedText,
        resolved: false
      });

      setNewComment('');
      setSelectedText('');
      
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Comment Failed',
        description: 'Failed to add comment',
        variant: 'destructive'
      });
    }
  };

  // Save version
  const handleSaveVersion = async () => {
    if (!auth.user || !versionName.trim()) return;

    setIsSaving(true);
    try {
      await createVersion(document._id, content, versionName, true);
      await onSave();
      
      setVersionName('');
      setLastSaved(new Date());
      
      // Refresh version history
      const updatedVersions = await loadVersionHistory(document._id);
      setVersions(updatedVersions);
      
      toast({
        title: 'Version Saved',
        description: `Version "${versionName}" has been created`,
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save version',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Collaboration Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Active Users */}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 5).map((user) => (
                    <Avatar key={user.user_id} className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {user.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {activeUsers.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs">+{activeUsers.length - 5}</span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {activeUsers.length} editing
                </span>
              </div>

              {/* Document Status */}
              <div className="flex items-center space-x-2">
                {isLocked ? (
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>Locked</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Edit3 className="h-3 w-3" />
                    <span>Editing</span>
                  </Badge>
                )}
                
                {lastSaved && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Comments */}
              <Dialog open={showComments} onOpenChange={setShowComments}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments ({documentComments.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Comments</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Comment on selected text..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      {selectedText && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          Selected: "{selectedText}"
                        </div>
                      )}
                      <Button onClick={handleAddComment} size="sm" className="w-full">
                        <Send className="h-3 w-3 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {documentComments.map((comment) => (
                          <div key={comment._id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{comment.author_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{comment.content}</p>
                            {comment.selection_text && (
                              <div className="text-xs bg-muted p-1 rounded">
                                "{comment.selection_text}"
                              </div>
                            )}
                            {comment.resolved && (
                              <Badge variant="outline" className="mt-2">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                        ))}
                        {documentComments.length === 0 && (
                          <p className="text-center text-muted-foreground text-sm">
                            No comments yet. Select text and add a comment.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Version History */}
              <Dialog open={showVersions} onOpenChange={setShowVersions}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    Versions ({versions.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Version History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Version name..."
                        value={versionName}
                        onChange={(e) => setVersionName(e.target.value)}
                      />
                      <Button 
                        onClick={handleSaveVersion} 
                        size="sm" 
                        className="w-full"
                        disabled={isSaving || !versionName.trim()}
                      >
                        <Save className="h-3 w-3 mr-2" />
                        {isSaving ? 'Saving...' : 'Create Version'}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {versions.map((version) => (
                          <div key={version._id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                Version {version.version}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(version.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{version.changes_summary}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                by {version.author_name}
                              </span>
                              {version.is_major && (
                                <Badge variant="outline">
                                  Major
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {versions.length === 0 && (
                          <p className="text-center text-muted-foreground text-sm">
                            No versions saved yet.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Lock Toggle */}
              <Button
                variant={isLocked ? "destructive" : "outline"}
                size="sm"
                onClick={handleToggleLock}
              >
                {isLocked ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlocked
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="p-0">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={handleTextSelection}
            disabled={isLocked}
            className="min-h-[500px] border-0 resize-none focus:ring-0"
            placeholder={isLocked ? "This document is locked by another user..." : "Start editing..."}
          />
        </CardContent>
      </Card>
    </div>
  );
};