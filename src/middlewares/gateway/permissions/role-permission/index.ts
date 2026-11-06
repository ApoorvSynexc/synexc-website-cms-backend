const rolePermissionPermissions = [
  {
    path: '/role-permission/permissions',
    method: 'GET',
    permissions: ['read:role_permission'],
  },
  {
    path: '/role-permission/list',
    method: 'GET',
    permissions: ['read:role_permission'],
  },
  {
    path: '/role-permission',
    method: 'PUT',
    permissions: ['update:role_permission'],
  },
];

export { rolePermissionPermissions };
