const blogPermissions = [
  {
    path: '/blog',
    method: 'POST',
    permissions: ['create:blog'],
  },
  {
    path: '/blog/list',
    method: 'GET',
    permissions: ['read:blog'],
  },
  {
    path: '/blog/stats',
    method: 'GET',
    permissions: ['read:blog'],
  },
  {
    path: '/blog',
    method: 'GET',
    permissions: ['read:blog'],
  },
  {
    path: '/blog',
    method: 'PUT',
    permissions: ['update:blog'],
  },
  {
    path: '/blog',
    method: 'DELETE',
    permissions: ['delete:blog'],
  },
];

export { blogPermissions };
