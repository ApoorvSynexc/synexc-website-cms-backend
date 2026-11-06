const blogCategoryPermissions = [
  {
    path: '/blog-category',
    method: 'POST',
    permissions: ['create:blog_category'],
  },
  // Writers need categories to fill in the blog form, so blog permissions unlock the category list too.
  {
    path: '/blog-category/list',
    method: 'GET',
    permissions: ['read:blog_category', 'create:blog', 'update:blog', 'read:blog'],
  },
  {
    path: '/blog-category',
    method: 'GET',
    permissions: ['read:blog_category'],
  },
  {
    path: '/blog-category',
    method: 'PUT',
    permissions: ['update:blog_category'],
  },
  {
    path: '/blog-category',
    method: 'DELETE',
    permissions: ['delete:blog_category'],
  },
];

export { blogCategoryPermissions };
