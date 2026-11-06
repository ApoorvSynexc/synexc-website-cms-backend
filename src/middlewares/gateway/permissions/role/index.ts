const rolePermissions = [
  {
    path: '/role',
    method: 'POST',
    permissions: ['create:role'],
  },
  // The user form needs the role list to pick a role.
  {
    path: '/role/list',
    method: 'GET',
    permissions: ['read:role', 'create:user', 'update:user', 'read:user'],
  },
  {
    path: '/role',
    method: 'GET',
    permissions: ['read:role'],
  },
  {
    path: '/role',
    method: 'PUT',
    permissions: ['update:role'],
  },
  {
    path: '/role',
    method: 'DELETE',
    permissions: ['delete:role'],
  },
];

export { rolePermissions };
