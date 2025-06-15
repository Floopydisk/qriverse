
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { acceptInvitation, cancelInvitation } from '@/lib/api/teams';

const TeamInvitations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['team-invitations'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return [];

      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          teams(name, description)
        `)
        .eq('email', user.user.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (token: string) => {
      await acceptInvitation(token);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Team invitation accepted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await cancelInvitation(invitationId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Team invitation declined',
      });
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline invitation',
        variant: 'destructive',
      });
    },
  });

  const handleAccept = (token: string) => {
    acceptMutation.mutate(token);
  };

  const handleDecline = (invitationId: string) => {
    declineMutation.mutate(invitationId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="bg-gray-200 h-16"></CardHeader>
            <CardContent className="bg-gray-100 h-12"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No pending invitations</h3>
        <p className="text-muted-foreground">
          You don't have any pending team invitations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{(invitation as any).teams?.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  You've been invited to join this team as a{' '}
                  <Badge variant="secondary">{invitation.role}</Badge>
                </p>
                {(invitation as any).teams?.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {(invitation as any).teams.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleAccept(invitation.token)}
                disabled={acceptMutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleDecline(invitation.id)}
                disabled={declineMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                {declineMutation.isPending ? 'Declining...' : 'Decline'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Expires: {new Date(invitation.expires_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeamInvitations;
