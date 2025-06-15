
-- Create the accept_team_invitation function
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.team_invitations;
  user_id UUID;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Find the invitation by token
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE token = invitation_token
    AND accepted_at IS NULL
    AND expires_at > now();

  -- Check if invitation exists and is valid
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;

  -- Check if the invitation email matches the current user's email
  IF invitation_record.email != (SELECT email FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'Invitation email does not match current user';
  END IF;

  -- Check if user is already a member of this team
  IF EXISTS (
    SELECT 1 FROM public.team_memberships 
    WHERE team_id = invitation_record.team_id 
    AND user_id = user_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of this team';
  END IF;

  -- Accept the invitation
  UPDATE public.team_invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;

  -- Add the user to team memberships
  INSERT INTO public.team_memberships (team_id, user_id, role, invited_by, invited_at, joined_at)
  VALUES (
    invitation_record.team_id,
    user_id,
    invitation_record.role,
    invitation_record.invited_by,
    invitation_record.created_at,
    now()
  );
END;
$$;
