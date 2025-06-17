
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCircles from '@/components/FloatingCircles';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, QrCode, Settings, Mail, Trash2, Crown, Shield, User, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserTeams, fetchTeamMembers, fetchTeamInvitations, inviteToTeam, removeMember, updateMemberRole, fetchQRCodesInTeam } from '@/lib/api/teams';
import TeamInviteDialog from '@/components/teams/TeamInviteDialog';
import TeamQRCodes from '@/components/teams/TeamQRCodes';

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchUserTeams,
  });

  const team = teams.find(t => t.id === teamId);

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => teamId ? fetchTeamMembers(teamId) : [],
    enabled: !!teamId,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['team-invitations', teamId],
    queryFn: () => teamId ? fetchTeamInvitations(teamId) : [],
    enabled: !!teamId,
  });

  const { data: teamQRCodes = [] } = useQuery({
    queryKey: ['team-qr-codes', teamId],
    queryFn: () => teamId ? fetchQRCodesInTeam(teamId) : [],
    enabled: !!teamId,
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Member removed from team',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: any }) => 
      updateMemberRole(membershipId, role),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Member role updated',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update member role',
        variant: 'destructive',
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'manager': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'manager': return 'outline';
      default: return 'outline';
    }
  };

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <FloatingCircles />
        <Header />
        <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Team not found</h1>
            <Button onClick={() => navigate('/teams')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <FloatingCircles />
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/teams')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              {team.description && (
                <p className="text-muted-foreground mt-1">{team.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowInviteDialog(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="overview">
                <Settings className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="mr-2 h-4 w-4" />
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="qr-codes">
                <QrCode className="mr-2 h-4 w-4" />
                QR Codes ({teamQRCodes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{members.length}</div>
                    <p className="text-sm text-muted-foreground">Active members</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      QR Codes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamQRCodes.length}</div>
                    <p className="text-sm text-muted-foreground">Team QR codes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Pending Invites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{invitations.length}</div>
                    <p className="text-sm text-muted-foreground">Awaiting response</p>
                  </CardContent>
                </Card>
              </div>

              {invitations.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{invitation.email}</div>
                            <div className="text-sm text-muted-foreground">
                              Invited as {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-muted h-16 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {getRoleIcon(member.role)}
                            </div>
                            <div>
                              <div className="font-medium">User {member.user_id.slice(0, 8)}...</div>
                              <div className="text-sm text-muted-foreground">
                                Joined {new Date(member.joined_at || member.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(member.role) as any}>
                              {member.role}
                            </Badge>
                            {member.role !== 'owner' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMemberMutation.mutate(member.id)}
                                disabled={removeMemberMutation.isPending}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr-codes" className="mt-6">
              <TeamQRCodes teamId={teamId!} qrCodes={teamQRCodes} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      <TeamInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        teamId={teamId!}
      />
    </div>
  );
};

export default TeamDetail;
