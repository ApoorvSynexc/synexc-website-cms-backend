import type {
  HeroSlide,
  Testimonial,
  Faq,
  PartnerLogo,
  TeamMember,
  TimelineEvent,
  Certification,
  KeyStat,
  GalleryImage,
} from '../../../generated/prisma/client.js';
import { mediaSelect } from '../media/index.js';
import { createOrderedListService } from './ordered-list.js';

export * from './ordered-list.js';

const file = { select: mediaSelect } as const;

// Lists that show a picture embed the linked Media row (id, name, size, mimetype, url, thumbnailUrl).
export const heroSlideService = createOrderedListService<HeroSlide>('heroSlide', 'hero slide', { image: file, logo: file });
export const testimonialService = createOrderedListService<Testimonial>('testimonial', 'testimonial', { avatar: file });
export const faqService = createOrderedListService<Faq>('faq', 'FAQ');
export const partnerLogoService = createOrderedListService<PartnerLogo>('partnerLogo', 'partner logo', { logo: file });
export const teamMemberService = createOrderedListService<TeamMember>('teamMember', 'team member', { photo: file });
export const timelineEventService = createOrderedListService<TimelineEvent>('timelineEvent', 'timeline event');
export const certificationService = createOrderedListService<Certification>('certification', 'certification');
export const keyStatService = createOrderedListService<KeyStat>('keyStat', 'key stat');
export const galleryImageService = createOrderedListService<GalleryImage>('galleryImage', 'gallery image', { image: file });
