const DEFAULT_OPTIONS: IntersectionObserverInit = {
	rootMargin: '0px 0px -10% 0px',
	threshold: 0.2,
};

let sharedObserver: IntersectionObserver | null = null;

const getObserver = () => {
	if (sharedObserver) return sharedObserver;

	sharedObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			const revealClass = entry.target.getAttribute('data-reveal-class') ?? 'is-visible';
			entry.target.classList.add(revealClass);
			observer.unobserve(entry.target);
		});
	}, DEFAULT_OPTIONS);

	return sharedObserver;
};

/**
 * Limpia el observer compartido y resetea el estado de los elementos.
 */
const cleanupObserver = () => {
	console.log('[viewportObserver] cleanupObserver called');
	if (sharedObserver) {
		sharedObserver.disconnect();
		sharedObserver = null;
	}
};

/**
 * Inicializa los elementos con la clase .js-viewport-reveal
 * Busca todos los elementos y los registra con el IntersectionObserver
 */
const initRevealElements = () => {
	const revealTargets = document.querySelectorAll('.js-viewport-reveal');
	revealTargets.forEach((target) => {
		const revealClass = target.getAttribute('data-reveal-class') ?? 'is-visible';
		// Asegurar que el elemento empiece sin la clase visible (por si viene de navegación)
		target.classList.remove(revealClass);
		target.setAttribute('data-reveal-class', revealClass);
		getObserver().observe(target);
	});
};

// Configurar listeners para View Transitions de Astro
if (typeof document !== 'undefined') {
	console.log('[viewportObserver] Setting up Astro event listeners');
	
	// Limpiar antes de cambiar de página
	document.addEventListener('astro:before-swap', cleanupObserver);
	
	// Inicializar elementos después de cada navegación (incluye carga inicial)
	document.addEventListener('astro:page-load', initRevealElements);
}

export const observeReveal = (target: Element, revealClass = 'is-visible') => {
	target.setAttribute('data-reveal-class', revealClass);
	getObserver().observe(target);
};
