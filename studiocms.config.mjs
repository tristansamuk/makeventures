import { studioCMSBlogPlugin } from '@studiocms/blog';
import { studiocmsMD } from '@studiocms/md';
import { defineStudioCMSConfig } from 'studiocms/config';

export default defineStudioCMSConfig({
  dbStartPage: false,
  plugins: [
    studiocmsMD(),
    studioCMSBlogPlugin({
      blog: {
        title: 'Make-ventures Blog',
        route: '/blog',
      },
      injectRoutes: false,
    }),
  ],
});
