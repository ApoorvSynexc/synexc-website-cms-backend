const announcementPermissions = [
  {
    path: '/announcement',
    method: 'POST',
    permissions: ['create:announcement'],
  },
  {
    path: '/announcement/list',
    method: 'GET',
    permissions: ['read:announcement'],
  },
  {
    path: '/announcement',
    method: 'GET',
    permissions: ['read:announcement'],
  },
  {
    path: '/announcement',
    method: 'PUT',
    permissions: ['update:announcement'],
  },
  {
    path: '/announcement',
    method: 'DELETE',
    permissions: ['delete:announcement'],
  },
];

export { announcementPermissions };
