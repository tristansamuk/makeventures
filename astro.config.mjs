// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { remarkVideo } from './src/plugins/remark-video.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://makeventures.netlify.app',
	markdown: {
		remarkPlugins: [remarkVideo],
	},
	integrations: [mdx(), sitemap()],
});
