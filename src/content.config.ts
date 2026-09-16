import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const versionSchema = z.object({
  app: z.string(),
  version: z.string(),
  date: z.string(),
  authorized_by: z.string(),
  commit: z.string(),
  summary: z.string(),
  type: z.enum(['patch', 'minor', 'major']),
});

export type VersionEntryData = z.infer<typeof versionSchema>;

export const versions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/versions' }),
  schema: versionSchema,
});

export const collections = {
  versions,
};
