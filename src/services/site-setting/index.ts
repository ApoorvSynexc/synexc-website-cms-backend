import { prisma } from '../../config/database/index.js';
import { Prisma, type SiteSetting } from '../../../generated/prisma/client.js';
import { db } from '../../utils/query.js';

const SETTING_KEY = 'default';

/** The single settings row (created by the seed). */
const findSiteSetting = (): Promise<SiteSetting | null> =>
  db('find site settings', () => prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } }));

const updateSiteSetting = (data: Prisma.SiteSettingUpdateInput): Promise<SiteSetting> =>
  db('update site settings', () => prisma.siteSetting.update({ where: { key: SETTING_KEY }, data }));

export { findSiteSetting, updateSiteSetting };
