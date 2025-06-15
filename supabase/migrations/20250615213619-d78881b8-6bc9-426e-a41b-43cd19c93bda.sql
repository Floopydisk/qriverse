
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'manager', 'member');

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create team memberships table
CREATE TABLE public.team_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team invitations table
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Add team_id to existing tables for team-based access
ALTER TABLE public.qr_codes ADD COLUMN team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.folders ADD COLUMN team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.dynamic_qr_codes ADD COLUMN team_id UUID REFERENCES public.teams(id);

-- Enable RLS on new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to check team permissions
CREATE OR REPLACE FUNCTION public.get_user_team_role(team_uuid UUID, user_uuid UUID)
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.team_memberships 
  WHERE team_id = team_uuid AND user_id = user_uuid AND joined_at IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_team(team_uuid UUID, user_uuid UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships 
    WHERE team_id = team_uuid AND user_id = user_uuid AND joined_at IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_team_admin(team_uuid UUID, user_uuid UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships 
    WHERE team_id = team_uuid AND user_id = user_uuid 
    AND role IN ('owner', 'admin') AND joined_at IS NOT NULL
  );
$$;

-- RLS Policies for teams table
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (public.user_can_access_team(id, auth.uid()));

CREATE POLICY "Team owners and admins can update teams" ON public.teams
  FOR UPDATE USING (public.user_is_team_admin(id, auth.uid()));

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team owners can delete teams" ON public.teams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_memberships 
      WHERE team_id = id AND user_id = auth.uid() 
      AND role = 'owner' AND joined_at IS NOT NULL
    )
  );

-- RLS Policies for team_memberships table
CREATE POLICY "Users can view memberships for teams they belong to" ON public.team_memberships
  FOR SELECT USING (public.user_can_access_team(team_id, auth.uid()));

CREATE POLICY "Team admins can manage memberships" ON public.team_memberships
  FOR ALL USING (public.user_is_team_admin(team_id, auth.uid()));

CREATE POLICY "Users can view their own membership" ON public.team_memberships
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for team_invitations table
CREATE POLICY "Team admins can manage invitations" ON public.team_invitations
  FOR ALL USING (public.user_is_team_admin(team_id, auth.uid()));

CREATE POLICY "Invited users can view their invitations" ON public.team_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Update existing RLS policies to include team access
-- QR Codes: Users can access their own QR codes OR team QR codes they have access to
DROP POLICY IF EXISTS "Users can view their own qr_codes" ON public.qr_codes;
CREATE POLICY "Users can view their own qr_codes or team qr_codes" ON public.qr_codes
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (team_id IS NOT NULL AND public.user_can_access_team(team_id, auth.uid()))
  );

-- Similar updates for folders and dynamic_qr_codes would go here...

-- Create trigger to automatically add team creator as owner
CREATE OR REPLACE FUNCTION public.add_team_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.team_memberships (team_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'owner', now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.add_team_creator_as_owner();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
