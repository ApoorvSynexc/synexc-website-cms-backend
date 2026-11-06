const caseStudyPermissions = [
  {
    path: '/case-study',
    method: 'POST',
    permissions: ['create:case_study'],
  },
  {
    path: '/case-study/list',
    method: 'GET',
    permissions: ['read:case_study'],
  },
  {
    path: '/case-study',
    method: 'GET',
    permissions: ['read:case_study'],
  },
  {
    path: '/case-study',
    method: 'PUT',
    permissions: ['update:case_study'],
  },
  {
    path: '/case-study',
    method: 'DELETE',
    permissions: ['delete:case_study'],
  },
];

export { caseStudyPermissions };
