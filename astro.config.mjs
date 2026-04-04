// @ts-check

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import studiocms from 'studiocms';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL || 'http://localhost:4321',
	output: 'server',
	adapter: netlify(),
	integrations: [mdx(), sitemap(), studiocms()],
});
