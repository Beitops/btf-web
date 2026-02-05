function initComparadorDropzone() {
	const dropzone = document.getElementById('dropzone');
	const fileInput = document.getElementById('file-input');

	if (!dropzone || !fileInput) return;
	if (dropzone.hasAttribute('data-comparador-initialized')) return;

	dropzone.setAttribute('data-comparador-initialized', 'true');

	// Click to open file picker
	dropzone.addEventListener('click', () => {
		if (fileInput instanceof HTMLInputElement) fileInput.click();
	});

	// Handle file selection
	fileInput.addEventListener('change', (e) => {
		const target = e.target;
		if (target instanceof HTMLInputElement && target.files && target.files.length > 0) {
			handleFile(target.files[0]);
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
			if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
				handleFile(file);
			} else {
				alert('Por favor, sube un archivo PDF o una imagen.');
			}
		}
	});

	async function handleFile(file: File) {
		const container = document.getElementById('comparador-modal-root');
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
			if (fileInput instanceof HTMLInputElement) {
				fileInput.value = '';
			}
		};
		const onAnalyze = (data: { file: File; nombre: string; telefono: string }) => {
			root.unmount();
			queueMicrotask(async () => {
				const [
					{ default: ReactLib },
					{ createRoot: createRootLib },
					{ default: Dashboard },
				] = await Promise.all([
					import('react'),
					import('react-dom/client'),
					import('../components/Dashboard'),
				]);
				const dashboardRoot = createRootLib(container);
				const onCloseDashboard = () => {
					dashboardRoot.unmount();
					if (fileInput instanceof HTMLInputElement) {
						fileInput.value = '';
					}
				};
				dashboardRoot.render(
					ReactLib.createElement(Dashboard, {
						file: data.file,
						nombre: data.nombre,
						telefono: data.telefono,
						onClose: onCloseDashboard,
					})
				);
			});
		};
		root.render(
			React.createElement(ComparadorIsla, { file, onClose, onAnalyze })
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
