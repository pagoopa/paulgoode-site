import { z } from 'astro/zod';

/** Art, Design, Spirit, Life, Studio. A series has one or more. */
export const domain = z.enum(['art', 'design', 'spirit', 'life', 'studio']);

/** A tag on a post: lowercase words joined by hyphens, like ghost-boy. */
export const tag = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export type Domain = z.infer<typeof domain>;

export const seriesStatus = z.enum(['exploring', 'active', 'resting', 'complete', 'promoted']);

export type SeriesStatus = z.infer<typeof seriesStatus>;
