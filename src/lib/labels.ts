import { z } from 'astro/zod';

/** Art, Design, Spirit, Life, Studio. A series has one or more. */
export const domain = z.enum(['art', 'design', 'spirit', 'life', 'studio']);

/** A tag on a post: lowercase words joined by hyphens, like ghost-boy. */
export const tag = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export type Domain = z.infer<typeof domain>;

export const seriesStatus = z.enum(['exploring', 'active', 'resting', 'complete', 'promoted']);

export type SeriesStatus = z.infer<typeof seriesStatus>;

/** What kind of project it is. Each has a filter chip on /projects and a card eyebrow. */
export const projectType = z.enum(['personal', 'case-study', 'art', 'music', 'resource']);

export type ProjectType = z.infer<typeof projectType>;

export const projectTypes: Record<ProjectType, { label: string; eyebrow: string }> = {
  personal: { label: 'Personal', eyebrow: 'Personal project' },
  'case-study': { label: 'Case Study', eyebrow: 'Case study' },
  art: { label: 'Art', eyebrow: 'Art' },
  music: { label: 'Music', eyebrow: 'Music' },
  resource: { label: 'Resource', eyebrow: 'Resource' },
};
