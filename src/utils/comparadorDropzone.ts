function initComparadorDropzone() {
	const dropzone = document.getElementById('dropzone');
	const fileInput = document.getElementById('file-input');
	const dropzoneText = document.getElementById('dropzone-text');

	if (!dropzone || !fileInput) return;

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

	function handleFile(file: File) {
		if (dropzoneText) {
			dropzoneText.textContent = `Archivo seleccionado: ${file.name}`;
			dropzoneText.classList.remove('text-gray-500');
			dropzoneText.classList.add('text-black', 'font-medium');
		}
		console.log('File uploaded:', file.name, file.type, file.size);
	}
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initComparadorDropzone);
	} else {
		initComparadorDropzone();
	}
}
