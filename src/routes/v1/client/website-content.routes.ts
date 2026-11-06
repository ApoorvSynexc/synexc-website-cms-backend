import { RequestHandler, Router } from 'express';
import {
  certificationController,
  faqController,
  galleryImageController,
  heroSlideController,
  keyStatController,
  partnerLogoController,
  teamMemberController,
  testimonialController,
  timelineEventController,
} from '../../../controller/index.js';
import { websiteContentValidation as v } from '../../../middlewares/index.js';

type Handler = (req: any, res: any) => Promise<void>;
type Controller = {
  createHandler: Handler;
  findAllHandler: Handler;
  findOneHandler: Handler;
  updateHandler: Handler;
  deleteHandler: Handler;
  moveHandler: Handler;
};
type Validators = { createValidation: RequestHandler; updateValidation: RequestHandler };

/** The same six routes for every ordered website list. */
const orderedListRouter = (controller: Controller, validators: Validators) => {
  const router = Router();
  router.post('/', validators.createValidation, controller.createHandler);
  router.get('/list', controller.findAllHandler);
  router.get('/', controller.findOneHandler);
  router.put('/move', v.moveValidation, controller.moveHandler);
  router.put('/', validators.updateValidation, controller.updateHandler);
  router.delete('/', controller.deleteHandler);
  return router;
};

export const heroSlideRouter = orderedListRouter(heroSlideController, v.heroSlide);
export const testimonialRouter = orderedListRouter(testimonialController, v.testimonial);
export const faqRouter = orderedListRouter(faqController, v.faq);
export const partnerLogoRouter = orderedListRouter(partnerLogoController, v.partnerLogo);
export const teamMemberRouter = orderedListRouter(teamMemberController, v.teamMember);
export const timelineEventRouter = orderedListRouter(timelineEventController, v.timelineEvent);
export const certificationRouter = orderedListRouter(certificationController, v.certification);
export const keyStatRouter = orderedListRouter(keyStatController, v.keyStat);
export const galleryImageRouter = orderedListRouter(galleryImageController, v.galleryImage);
