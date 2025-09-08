import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollaborationStore } from '@/store/collaboration-store';
import { useAppStore } from '@/store/app-store';
import { UserPresence } from '@/types';
import { Users } from 'lucide-react';

interface ActiveCollaboratorsProps {
  documentId: string;
  maxShow?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ActiveCollaborators: React.FC<ActiveCollaboratorsProps> = ({
  documentId,
  maxShow = 3,
  size = 'sm'
}) => {
  const { auth } = useAppStore();
  const { getActiveUsers } = useCollaborationStore();
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    const updateActiveUsers = () => {
      const users = getActiveUsers(documentId);
      // Filter out current user
      const otherUsers = users.filter(user => user.user_id !== auth.user?.uid);
      setActiveUsers(otherUsers);
    };

    // Update immediately
    updateActiveUsers();

    // Set up interval to check for active users
    const interval = setInterval(updateActiveUsers, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [documentId, auth.user]);

  if (activeUsers.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        <Users className={`${sizeClasses[size]} text-muted-foreground`} />
        <div className="flex -space-x-2">
          {activeUsers.slice(0, maxShow).map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <Avatar className={`${sizeClasses[size]} border-2 border-background`}>
                  <AvatarFallback className={textSizeClasses[size]}>
                    {user.user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">{user.user_name}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      user.is_editing ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-xs">
                      {user.is_editing ? 'Editing' : 'Viewing'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active {Math.floor((Date.now() - user.last_active) / 60000)}m ago
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {activeUsers.length > maxShow && (
            <Tooltip>
              <TooltipTrigger>
                <div className={`${sizeClasses[size]} rounded-full bg-muted border-2 border-background flex items-center justify-center`}>
                  <span className={textSizeClasses[size]}>
                    +{activeUsers.length - maxShow}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">Additional collaborators:</p>
                  {activeUsers.slice(maxShow).map((user) => (
                    <div key={user.user_id} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        user.is_editing ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-xs">{user.user_name}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <Badge variant="secondary" className={`${textSizeClasses[size]} ml-2`}>
          {activeUsers.length} active
        </Badge>
      </div>
    </TooltipProvider>
  );
};