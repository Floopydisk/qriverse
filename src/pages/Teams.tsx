
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCircles from '@/components/FloatingCircles';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserTeams } from '@/lib/api/teams';
import TeamsList from '@/components/teams/TeamsList';
import CreateTeamDialog from '@/components/teams/CreateTeamDialog';
import TeamInvitations from '@/components/teams/TeamInvitations';
import DashboardSidebar from '@/components/DashboardSidebar';

const Teams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('teams');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    data: teams = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchUserTeams,
  });

  const handleTeamCreated = () => {
    refetch();
    setShowCreateDialog(false);
    toast({
      title: 'Success',
      description: 'Team created successfully',
    });
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex">
      <FloatingCircles />
      
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-background border-r border-border h-screen fixed top-0 left-0 transition-all duration-200 z-10`}>
        <DashboardSidebar 
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>
      
      <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-primary">Team</span> Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Collaborate with your team on QR code projects
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Team
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="teams" className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                My Teams
              </TabsTrigger>
              <TabsTrigger value="invitations" className="flex-1">
                <UserPlus className="mr-2 h-4 w-4" />
                Invitations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-6">
              <TeamsList teams={teams} isLoading={isLoading} onTeamClick={(teamId) => navigate(`/teams/${teamId}`)} />
            </TabsContent>

            <TabsContent value="invitations" className="mt-6">
              <TeamInvitations />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
};

export default Teams;
