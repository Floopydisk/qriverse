
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamMembership = Database['public']['Tables']['team_memberships']['Row'];
export type TeamInvitation = Database['public']['Tables']['team_invitations']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];

export interface TeamWithMemberships extends Team {
  memberships?: (TeamMembership & {
    profiles?: { full_name: string | null; email?: string }
  })[];
}

// Team CRUD operations
export const createTeam = async (name: string, description?: string): Promise<Team> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('teams')
    .insert({ 
      name, 
      description: description || null,
      created_by: user.id 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserTeams = async (): Promise<TeamWithMemberships[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      memberships:team_memberships(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateTeam = async (id: string, updates: { name?: string; description?: string }): Promise<Team> => {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Team membership operations
export const fetchTeamMembers = async (teamId: string): Promise<TeamMembership[]> => {
  const { data, error } = await supabase
    .from('team_memberships')
    .select('*')
    .eq('team_id', teamId)
    .not('joined_at', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateMemberRole = async (membershipId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('team_memberships')
    .update({ role })
    .eq('id', membershipId);

  if (error) throw error;
};

export const removeMember = async (membershipId: string): Promise<void> => {
  const { error } = await supabase
    .from('team_memberships')
    .delete()
    .eq('id', membershipId);

  if (error) throw error;
};

// Team invitation operations
export const inviteToTeam = async (teamId: string, email: string, role: UserRole = 'member'): Promise<TeamInvitation> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('team_invitations')
    .insert({ 
      team_id: teamId, 
      email, 
      role,
      invited_by: user.id 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchTeamInvitations = async (teamId: string): Promise<TeamInvitation[]> => {
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('team_id', teamId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const cancelInvitation = async (invitationId: string): Promise<void> => {
  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) throw error;
};

export const acceptInvitation = async (token: string): Promise<void> => {
  const { error } = await supabase.rpc('accept_team_invitation', { invitation_token: token });
  if (error) throw error;
};

// Get user's role in a team
export const getUserTeamRole = async (teamId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('team_memberships')
    .select('role')
    .eq('team_id', teamId)
    .not('joined_at', 'is', null)
    .single();

  if (error) return null;
  return data?.role || null;
};
