import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Update domain ke Vercel
  site: 'https://sukadanailir.vercel.app', 
  integrations: [tailwind(), sitemap()]
});