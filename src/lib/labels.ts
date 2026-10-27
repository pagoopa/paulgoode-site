import { z } from 'astro/zod';

/** Art, Design, Spirit, Life, Studio. A series has one or more. */
export const domain = z.enum(['art', 'design', 'spirit', 'life', 'studio']);

export const seriesStatus = z.enum(['exploring', 'active', 'resting', 'complete', 'promoted']);

export type SeriesStatus = z.infer<typeof seriesStatus>;
