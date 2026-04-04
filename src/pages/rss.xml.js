import rss from '@astrojs/rss';
import { runSDK, SDKCoreJs } from 'studiocms:sdk';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const allPages = await runSDK(SDKCoreJs.GET.pages());
	const posts = allPages.filter((p) => p.package === '@studiocms/blog');

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: post.publishedAt,
			link: `/blog/${post.slug}/`,
		})),
	});
}
