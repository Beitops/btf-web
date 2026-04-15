// Astro view transitions scroll behavior redirect to old section when the page is reloaded.
// This code just avoid that behavior.

export const scrollBehavior = () => {
	if (typeof document !== 'undefined') {
		document.addEventListener('astro:page-load', () => {
			window.scrollTo({ top: 0 });
		});
	}
}