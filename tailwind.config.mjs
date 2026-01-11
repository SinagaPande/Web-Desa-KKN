/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'lampung-dark': '#2d2520',
				'lampung-bone': '#f3eedc',
				'lampung-gold': '#f0c65c',
			},
			fontFamily: {
				serif: ['"Playfair Display"', '"Times New Roman"', 'serif'],
			},
		},
	},
	plugins: [],
}