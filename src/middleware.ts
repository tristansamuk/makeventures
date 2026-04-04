import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	// Handle CORS preflight for Studio CMS API routes
	if (context.url.pathname.startsWith('/studiocms_api/')) {
		const origin = context.request.headers.get('origin') ?? '';

		if (context.request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Allow-Credentials': 'true',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		const response = await next();
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
		return response;
	}

	return next();
});
