
// Re-export everything from the individual API files
export * from './qr-codes';
export * from './folders';
export * from './profile';
export * from './dynamic-qr';
export { 
  fetchUserTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  fetchTeamMembers,
  updateMemberRole,
  removeMember,
  inviteToTeam,
  fetchTeamInvitations,
  cancelInvitation,
  acceptInvitation,
  getUserTeamRole,
  type TeamWithMemberships,
  type UserRole
} from './teams'; // Explicitly export only the functions and specific types

export { 
  fetchUserBarcodes,
  createBarcode,
  deleteBarcode,
  updateBarcode
} from './barcodes'; // Only export the functions, not the interface

// Export the types from types.ts (these will be the canonical ones)
export * from './types';
