import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


export default defineConfig(({ mode }) => {
	return {
		define: {
			'process.env.NODE_ENV': mode === 'production' ? '"production"' : '"development"'
		},
		plugins: [sveltekit()]
	};
});