
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Settings } from 'lucide-react';
import { TeamWithMemberships } from '@/lib/api/teams';

interface TeamsListProps {
  teams: TeamWithMemberships[];
  isLoading: boolean;
  onTeamClick: (teamId: string) => void;
}

const TeamsList = ({ teams, isLoading, onTeamClick }: TeamsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="animate-pulse bg-gray-200 h-20 rounded-t-lg"></CardHeader>
            <CardContent className="animate-pulse bg-gray-100 h-24"></CardContent>
            <CardFooter className="animate-pulse bg-gray-200 h-12 rounded-b-lg"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No teams found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first team to start collaborating
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <Card key={team.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                {team.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {team.description}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                onTeamClick(team.id);
              }}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{team.memberships?.length || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(team.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onTeamClick(team.id)}
            >
              Manage Team
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TeamsList;
