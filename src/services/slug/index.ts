import { randomBytes } from 'node:crypto';
import { prisma } from '../../config/database/index.js';
import { db } from '../../utils/query.js';
import { generateSlug } from '../../utils/helper.js';

type SlugModel = 'blog' | 'caseStudy' | 'blogCategory';

/** Slugs are unique across ALL rows, soft-deleted ones included (the DB constraint does not ignore them). */
const slugTaken = (model: SlugModel, slug: string): Promise<boolean> =>
  db(`check ${model} slug`, async () => {
    const where = { slug };
    const count =
      model === 'blog'
        ? await prisma.blog.count({ where })
        : model === 'caseStudy'
          ? await prisma.caseStudy.count({ where })
          : await prisma.blogCategory.count({ where });
    return count > 0;
  });

/**
 * The slug is decided by the server, never typed by the user: "How AI Is Changing Gaming!" ->
 * "how-ai-is-changing-gaming", and "-2", "-3"… is appended while it is already used.
 * A title with no Latin letters/digits falls back to a short random id.
 */
const uniqueSlug = async (model: SlugModel, text: string, maxLength = 100): Promise<string> => {
  const base = generateSlug(text).slice(0, maxLength).replace(/-+$/g, '') || randomBytes(4).toString('hex');
  let candidate = base;
  for (let n = 2; await slugTaken(model, candidate); n++) candidate = `${base}-${n}`;
  return candidate;
};

export { uniqueSlug };
