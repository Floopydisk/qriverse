
import React, { useState, useEffect } from 'react';
import { useTeamAccess } from '@/hooks/useAccessControl';
import { TeamResource, TeamAction } from '@/lib/security/team-access-control';

interface TeamPermissionGateProps {
  teamId: string;
  resource: TeamResource;
  action: TeamAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const TeamPermissionGate: React.FC<TeamPermissionGateProps> = ({
  teamId,
  resource,
  action,
  fallback = null,
  children
}) => {
  const { canAccessResource, isLoading } = useTeamAccess(teamId);
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setChecking(true);
      const access = await canAccessResource(resource, action);
      setHasAccess(access);
      setChecking(false);
    };

    if (!isLoading) {
      checkAccess();
    }
  }, [canAccessResource, resource, action, isLoading]);

  if (isLoading || checking) {
    return (
      <div className="animate-pulse bg-muted h-8 rounded"></div>
    );
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default TeamPermissionGate;
