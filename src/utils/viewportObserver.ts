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

export const observeReveal = (target: Element, revealClass = 'is-visible') => {
	target.setAttribute('data-reveal-class', revealClass);
	getObserver().observe(target);
};
