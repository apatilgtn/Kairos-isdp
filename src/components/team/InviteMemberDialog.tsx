import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { useAuthCompat } from '@/hooks/use-auth-compat';
import { useTeamStore } from '@/store/team-store';
import { APIService } from '@/lib/api';
import { TeamRole } from '@/types';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  onInvitationSent: () => void;
}

export function InviteMemberDialog({ open, onOpenChange, teamId, onInvitationSent }: InviteMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<TeamRole, 'owner'>>('member');

  const { auth } = useAuthCompat();
  const { addNotification } = useAppStore();
  const { getUserRole } = useTeamStore();

  const currentUserRole = auth.user ? getUserRole(auth.user.uid) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    if (!email.trim() || !role) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      addNotification({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);
    try {
      const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now

      const token = await APIService.createInvitation({
        team_id: teamId,
        email: email.trim().toLowerCase(),
        role,
        invited_by: auth.user.uid,
        expires_at: expiresAt,
        status: 'pending',
      });

      // Log activity
      await APIService.logActivity({
        team_id: teamId,
        user_id: auth.user.uid,
        action_type: 'member_invited',
        resource_type: 'member',
        resource_id: token,
        details: {
          user_name: auth.user.name,
          invited_email: email.trim(),
          role: role,
        },
      });

      addNotification({
        type: 'success',
        title: 'Invitation Sent',
        message: `Team invitation sent to ${email.trim()}`,
      });

      // Reset form
      setEmail('');
      setRole('member');
      onInvitationSent();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      addNotification({
        type: 'error',
        title: 'Invitation Failed',
        message: 'Failed to send team invitation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles: Array<{ value: Exclude<TeamRole, 'owner'>; label: string; description: string }> = [
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Can view projects and documents but cannot edit or create'
    },
    {
      value: 'member',
      label: 'Member',
      description: 'Can create and edit projects, generate documents'
    },
    ...(currentUserRole === 'owner' ? [{
      value: 'admin' as const,
      label: 'Admin',
      description: 'Can manage members and have full project access'
    }] : [])
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They'll receive an email with instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Exclude<TeamRole, 'owner'>)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{roleOption.label}</span>
                      <span className="text-xs text-gray-600">{roleOption.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The invitation will expire in 7 days. The invited person will need to 
              create an account or sign in to accept the invitation.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}