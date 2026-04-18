function initComparadorDropzone() {
	const dropzone = document.getElementById('dropzone');
	const fileInput = document.getElementById('file-input');

	if (!dropzone || !fileInput) return;
	if (dropzone.hasAttribute('data-comparador-initialized')) return;

	dropzone.setAttribute('data-comparador-initialized', 'true');

	const promocionRaw = dropzone.getAttribute('data-promocion');
	const promocion = promocionRaw ? JSON.parse(promocionRaw) : null;
	const utmSource   = dropzone.getAttribute('data-utm-source') ?? '';
	const utmMedium   = dropzone.getAttribute('data-utm-medium') ?? '';
	const utmCampaign = dropzone.getAttribute('data-utm-campaign') ?? '';
	const container = document.getElementById('comparador-modal-root');

	const errorEl = document.getElementById('dropzone-error');

	function resetFileInput() {
		if (fileInput instanceof HTMLInputElement) fileInput.value = '';
	}

	function showFileError(msg: string) {
		if (errorEl) {
			errorEl.textContent = msg;
			errorEl.classList.remove('hidden');
			setTimeout(() => errorEl.classList.add('hidden'), 5000);
		}
	}

	function isPdf(file: File): boolean {
		return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
	}

	async function openDashboard(data: { file?: File; nombre: string; telefono: string }) {
		if (!container) return;

		const [{ default: ReactLib }, { createRoot }, { default: Dashboard }] = await Promise.all([
			import('react'),
			import('react-dom/client'),
			import('../components/Dashboard'),
		]);

		const root = createRoot(container);
		const onClose = () => {
			root.unmount();
			resetFileInput();
		};

		root.render(
			ReactLib.createElement(Dashboard, {
				file: data.file,
				nombre: data.nombre,
				telefono: data.telefono,
				promocion,
				utmSource,
				utmMedium,
				utmCampaign,
				onClose,
			})
		);
	}

	// Auto-restore session if page was reloaded while wizard was open
	try {
		const sessionRaw = sessionStorage.getItem('btf_session');
		if (sessionRaw) {
			const session = JSON.parse(sessionRaw);
			if (session.nombre && session.telefono) {
				openDashboard({ nombre: session.nombre, telefono: session.telefono });
			}
		}
	} catch {
		try { sessionStorage.removeItem('btf_session'); } catch {}
	}

	// Click to open file picker
	dropzone.addEventListener('click', () => {
		if (fileInput instanceof HTMLInputElement) fileInput.click();
	});

	// Handle file selection
	fileInput.addEventListener('change', (e) => {
		const target = e.target;
		if (target instanceof HTMLInputElement && target.files && target.files.length > 0) {
			const file = target.files[0];
			if (!isPdf(file)) {
				showFileError('Formato no admitido. Por favor, sube un archivo PDF.');
				resetFileInput();
				return;
			}
			handleFile(file);
		}
	});

	// Drag and drop events
	dropzone.addEventListener('dragover', (e) => {
		e.preventDefault();
		dropzone.classList.add('border-black', 'bg-gray-50');
		dropzone.classList.remove('border-gray-200');
	});

	dropzone.addEventListener('dragleave', (e) => {
		e.preventDefault();
		dropzone.classList.remove('border-black', 'bg-gray-50');
		dropzone.classList.add('border-gray-200');
	});

	dropzone.addEventListener('drop', (e) => {
		e.preventDefault();
		dropzone.classList.remove('border-black', 'bg-gray-50');
		dropzone.classList.add('border-gray-200');

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (!isPdf(file)) {
				showFileError('Formato no admitido. Por favor, sube un archivo PDF.');
				return;
			}
			handleFile(file);
		}
	});

	async function handleFile(file: File) {
		if (!container) return;

		const [{ default: React }, { createRoot }, { default: ComparadorIsla }] =
			await Promise.all([
				import('react'),
				import('react-dom/client'),
				import('../components/ComparadorIsla'),
			]);

		const root = createRoot(container);
		const onClose = () => {
			root.unmount();
			resetFileInput();
		};
		const onAnalyze = (data: { file: File; nombre: string; telefono: string }) => {
			root.unmount();
			queueMicrotask(() => {
				openDashboard(data);
			});
		};
		root.render(
			React.createElement(ComparadorIsla, { file, onClose, onAnalyze, promocion })
		);
	}
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initComparadorDropzone);
	} else {
		initComparadorDropzone();
	}
	document.addEventListener('astro:page-load', initComparadorDropzone);
}
