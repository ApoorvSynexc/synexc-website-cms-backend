// Only the Super Admin holds these by default; it can delegate them to a custom role.
const userPermissions = [
  {
    path: '/user',
    method: 'POST',
    permissions: ['create:user'],
  },
  {
    path: '/user/list',
    method: 'GET',
    permissions: ['read:user'],
  },
  {
    path: '/user',
    method: 'GET',
    permissions: ['read:user'],
  },
  {
    path: '/user',
    method: 'PUT',
    permissions: ['update:user'],
  },
  {
    path: '/user',
    method: 'DELETE',
    permissions: ['delete:user'],
  },
];

export { userPermissions };
