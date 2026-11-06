const siteSettingPermissions = [
  {
    path: '/site-setting',
    method: 'GET',
    permissions: ['read:site_settings'],
  },
  {
    path: '/site-setting',
    method: 'PUT',
    permissions: ['update:site_settings'],
  },
];

export { siteSettingPermissions };
