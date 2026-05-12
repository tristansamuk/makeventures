import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image(),
			tags: z.array(z.string()),
			author: z.string(),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			navTitle: z.string().optional(),
			description: z.string(),
			heroImage: image(),
			pubDate: z.coerce.date(),
			status: z.enum(['completed', 'in-progress', 'paused']).optional(),
			completedDate: z.coerce.date().optional(),
			featuredStat: z.string().optional(),
		}),
});

export const collections = { blog, projects };
