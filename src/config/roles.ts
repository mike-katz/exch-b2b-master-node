const allRoles = {
  Admin: [],
  WhiteLabel: [],
  Super: [],
  Master: [],
  Agent: [],
  User: []
};

export const roles: string[] = Object.keys(allRoles);
export const roleRights: Map<string, string[]> = new Map(
  Object.entries(allRoles)
);
