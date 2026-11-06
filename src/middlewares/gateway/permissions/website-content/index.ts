const heroSlidePermissions = [
  {
    path: '/hero-slide',
    method: 'POST',
    permissions: ['create:hero_slide'],
  },
  {
    path: '/hero-slide/list',
    method: 'GET',
    permissions: ['read:hero_slide'],
  },
  {
    path: '/hero-slide',
    method: 'GET',
    permissions: ['read:hero_slide'],
  },
  {
    path: '/hero-slide',
    method: 'PUT',
    permissions: ['update:hero_slide'],
  },
  {
    path: '/hero-slide',
    method: 'DELETE',
    permissions: ['delete:hero_slide'],
  },
  {
    path: '/hero-slide/move',
    method: 'PUT',
    permissions: ['update:hero_slide'],
  },
];

const testimonialPermissions = [
  {
    path: '/testimonial',
    method: 'POST',
    permissions: ['create:testimonial'],
  },
  {
    path: '/testimonial/list',
    method: 'GET',
    permissions: ['read:testimonial'],
  },
  {
    path: '/testimonial',
    method: 'GET',
    permissions: ['read:testimonial'],
  },
  {
    path: '/testimonial',
    method: 'PUT',
    permissions: ['update:testimonial'],
  },
  {
    path: '/testimonial',
    method: 'DELETE',
    permissions: ['delete:testimonial'],
  },
  {
    path: '/testimonial/move',
    method: 'PUT',
    permissions: ['update:testimonial'],
  },
];

const faqPermissions = [
  {
    path: '/faq',
    method: 'POST',
    permissions: ['create:faq'],
  },
  {
    path: '/faq/list',
    method: 'GET',
    permissions: ['read:faq'],
  },
  {
    path: '/faq',
    method: 'GET',
    permissions: ['read:faq'],
  },
  {
    path: '/faq',
    method: 'PUT',
    permissions: ['update:faq'],
  },
  {
    path: '/faq',
    method: 'DELETE',
    permissions: ['delete:faq'],
  },
  {
    path: '/faq/move',
    method: 'PUT',
    permissions: ['update:faq'],
  },
];

const partnerLogoPermissions = [
  {
    path: '/partner-logo',
    method: 'POST',
    permissions: ['create:partner_logo'],
  },
  {
    path: '/partner-logo/list',
    method: 'GET',
    permissions: ['read:partner_logo'],
  },
  {
    path: '/partner-logo',
    method: 'GET',
    permissions: ['read:partner_logo'],
  },
  {
    path: '/partner-logo',
    method: 'PUT',
    permissions: ['update:partner_logo'],
  },
  {
    path: '/partner-logo',
    method: 'DELETE',
    permissions: ['delete:partner_logo'],
  },
  {
    path: '/partner-logo/move',
    method: 'PUT',
    permissions: ['update:partner_logo'],
  },
];

const teamMemberPermissions = [
  {
    path: '/team-member',
    method: 'POST',
    permissions: ['create:team_member'],
  },
  {
    path: '/team-member/list',
    method: 'GET',
    permissions: ['read:team_member'],
  },
  {
    path: '/team-member',
    method: 'GET',
    permissions: ['read:team_member'],
  },
  {
    path: '/team-member',
    method: 'PUT',
    permissions: ['update:team_member'],
  },
  {
    path: '/team-member',
    method: 'DELETE',
    permissions: ['delete:team_member'],
  },
  {
    path: '/team-member/move',
    method: 'PUT',
    permissions: ['update:team_member'],
  },
];

const timelineEventPermissions = [
  {
    path: '/timeline-event',
    method: 'POST',
    permissions: ['create:timeline_event'],
  },
  {
    path: '/timeline-event/list',
    method: 'GET',
    permissions: ['read:timeline_event'],
  },
  {
    path: '/timeline-event',
    method: 'GET',
    permissions: ['read:timeline_event'],
  },
  {
    path: '/timeline-event',
    method: 'PUT',
    permissions: ['update:timeline_event'],
  },
  {
    path: '/timeline-event',
    method: 'DELETE',
    permissions: ['delete:timeline_event'],
  },
  {
    path: '/timeline-event/move',
    method: 'PUT',
    permissions: ['update:timeline_event'],
  },
];

const certificationPermissions = [
  {
    path: '/certification',
    method: 'POST',
    permissions: ['create:certification'],
  },
  {
    path: '/certification/list',
    method: 'GET',
    permissions: ['read:certification'],
  },
  {
    path: '/certification',
    method: 'GET',
    permissions: ['read:certification'],
  },
  {
    path: '/certification',
    method: 'PUT',
    permissions: ['update:certification'],
  },
  {
    path: '/certification',
    method: 'DELETE',
    permissions: ['delete:certification'],
  },
  {
    path: '/certification/move',
    method: 'PUT',
    permissions: ['update:certification'],
  },
];

const keyStatPermissions = [
  {
    path: '/key-stat',
    method: 'POST',
    permissions: ['create:key_stat'],
  },
  {
    path: '/key-stat/list',
    method: 'GET',
    permissions: ['read:key_stat'],
  },
  {
    path: '/key-stat',
    method: 'GET',
    permissions: ['read:key_stat'],
  },
  {
    path: '/key-stat',
    method: 'PUT',
    permissions: ['update:key_stat'],
  },
  {
    path: '/key-stat',
    method: 'DELETE',
    permissions: ['delete:key_stat'],
  },
  {
    path: '/key-stat/move',
    method: 'PUT',
    permissions: ['update:key_stat'],
  },
];

const galleryImagePermissions = [
  {
    path: '/gallery-image',
    method: 'POST',
    permissions: ['create:gallery_image'],
  },
  {
    path: '/gallery-image/list',
    method: 'GET',
    permissions: ['read:gallery_image'],
  },
  {
    path: '/gallery-image',
    method: 'GET',
    permissions: ['read:gallery_image'],
  },
  {
    path: '/gallery-image',
    method: 'PUT',
    permissions: ['update:gallery_image'],
  },
  {
    path: '/gallery-image',
    method: 'DELETE',
    permissions: ['delete:gallery_image'],
  },
  {
    path: '/gallery-image/move',
    method: 'PUT',
    permissions: ['update:gallery_image'],
  },
];

export { heroSlidePermissions, testimonialPermissions, faqPermissions, partnerLogoPermissions, teamMemberPermissions, timelineEventPermissions, certificationPermissions, keyStatPermissions, galleryImagePermissions };
