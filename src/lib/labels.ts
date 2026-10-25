import { z } from 'astro/zod';

/** Art, Design, Spirit, Life, Studio. A note has one; a series has one or more. */
export const domain = z.enum(['art', 'design', 'spirit', 'life', 'studio']);

/** Kebab-case thread name. A thread is the seed of a future series. */
export const thread = z.string().regex(/^[a-z0-9-]+$/);

export const seriesStatus = z.enum(['exploring', 'active', 'resting', 'complete', 'promoted']);

export type SeriesStatus = z.infer<typeof seriesStatus>;
