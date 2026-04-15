import React, { useRef, useState, type FC } from 'react';
import ProgresoContratacion from './ProgresoContratacion';

export interface DniData {
	frente: File | null;
	dorso: File | null;
	autorizado: boolean;
}

interface ValidacionDni {
	estado: 'idle' | 'validando' | 'ok' | 'error';
	motivo?: string;
}

interface PasoDNIProps {
	data: DniData;
	enviando: boolean;
	errorEnvio: string | null;
	onFrenteChange: (file: File | null) => void;
	onDorsoChange: (file: File | null) => void;
	onAutorizadoChange: (checked: boolean) => void;
	onBack: () => void;
	onSubmit: () => void;
}

async function validarImagen(file: File): Promise<{ valido: boolean; lado: string; motivo: string }> {
	const formData = new FormData();
	formData.append('imagen', file);
	const res = await fetch('/api/validar-dni', { method: 'POST', body: formData });
	if (!res.ok) return { valido: false, lado: 'otro', motivo: 'No se pudo verificar la imagen.' };
	const json = await res.json();
	return { valido: json.valido === true, lado: json.lado ?? 'otro', motivo: json.motivo ?? '' };
}

const IconoDNI: FC<{ lado: 'frente' | 'dorso' }> = ({ lado }) => (
	<svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		{lado === 'frente' ? (
			<>
				<rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.5} />
				<circle cx="8" cy="11" r="2.5" strokeWidth={1.5} />
				<path strokeLinecap="round" strokeWidth={1.5} d="M13 10h4M13 13h3" />
			</>
		) : (
			<>
				<rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.5} />
				<path strokeLinecap="round" strokeWidth={1.5} d="M6 10h12M6 13h8M6 16h5" />
			</>
		)}
	</svg>
);

interface ZonaUploadProps {
	label: string;
	sublabel: string;
	icono: React.ReactNode;
	file: File | null;
	inputId: string;
	ladoEsperado: 'frente' | 'dorso';
	validacion: ValidacionDni;
	onChange: (file: File | null, validacion: ValidacionDni) => void;
}

const ZonaUpload: FC<ZonaUploadProps> = ({ label, sublabel, icono, file, inputId, ladoEsperado, validacion, onChange }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);

	async function handleFile(f: File | null) {
		if (!f) return;
		const url = URL.createObjectURL(f);
		setPreview(url);
		onChange(f, { estado: 'validando' });

		try {
			const resultado = await validarImagen(f);
			console.log('[PasoDNI] Resultado validación:', resultado);

			if (!resultado.valido) {
				onChange(f, { estado: 'error', motivo: resultado.motivo });
			} else if (resultado.lado !== 'otro' && resultado.lado !== ladoEsperado) {
				const ladoIncorrecto = resultado.lado === 'frente' ? 'delantera' : 'trasera';
				const zonaCorrecta = resultado.lado === 'frente' ? 'Parte delantera' : 'Parte trasera';
				onChange(f, {
					estado: 'error',
					motivo: `Esto parece la cara ${ladoIncorrecto} del DNI — súbelo en la zona "${zonaCorrecta}".`,
				});
			} else {
				onChange(f, { estado: 'ok', motivo: resultado.motivo });
			}
		} catch (err) {
			console.error('[PasoDNI] Error llamando /api/validar-dni:', err);
			onChange(f, { estado: 'error', motivo: 'Error al verificar el documento. Inténtalo de nuevo.' });
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		handleFile(e.target.files?.[0] ?? null);
	}

	function handleDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		handleFile(e.dataTransfer.files?.[0] ?? null);
	}

	const borderColor =
		validacion.estado === 'ok'
			? 'border-[#00bf63]/60 bg-[#00bf63]/5'
			: validacion.estado === 'error'
				? 'border-red-300 bg-red-50/50'
				: file
					? 'border-[#00bf63]/40 bg-[#00bf63]/5'
					: 'border-gray-200 bg-gray-50 hover:border-[#00bf63]/40 hover:bg-[#00bf63]/5';

	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm font-semibold text-gray-700">{label}</p>
			<div
				onClick={() => inputRef.current?.click()}
				onDrop={handleDrop}
				onDragOver={(e) => e.preventDefault()}
				className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 ${borderColor}`}
			>
				{preview ? (
					<>
						<img
							src={preview}
							alt={label}
							className="max-h-32 w-auto rounded-lg object-contain shadow-sm"
						/>
						<p className="text-xs text-gray-400">Toca para cambiar</p>
					</>
				) : (
					<>
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
							{icono}
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-700">{sublabel}</p>
							<p className="mt-0.5 text-xs text-gray-400">Foto, galería o arrastra aquí</p>
						</div>
					</>
				)}
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept="image/*,application/pdf"
					className="sr-only"
					onChange={handleChange}
				/>
			</div>

			{/* Feedback de validación */}
			{validacion.estado === 'validando' && (
				<div className="flex items-center gap-2 text-xs text-gray-500">
					<svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
					</svg>
					Verificando documento…
				</div>
			)}
			{validacion.estado === 'ok' && (
				<p className="flex items-center gap-1.5 text-xs font-medium text-[#00a458]">
					<span>✓</span> Documento verificado correctamente
				</p>
			)}
			{validacion.estado === 'error' && (
				<p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
					<span>✗</span> {validacion.motivo || 'No parece un DNI o NIE válido. Sube otra imagen.'}
				</p>
			)}
		</div>
	);
};

const PasoDNI: FC<PasoDNIProps> = ({
	data,
	enviando,
	errorEnvio,
	onFrenteChange,
	onDorsoChange,
	onAutorizadoChange,
	onBack,
	onSubmit,
}) => {
	const [validacionFrente, setValidacionFrente] = useState<ValidacionDni>({ estado: 'idle' });
	const [validacionDorso, setValidacionDorso] = useState<ValidacionDni>({ estado: 'idle' });

	const puedeEnviar =
		data.frente !== null &&
		data.dorso !== null &&
		data.autorizado &&
		validacionFrente.estado !== 'error' &&
		validacionDorso.estado !== 'error' &&
		validacionFrente.estado !== 'validando' &&
		validacionDorso.estado !== 'validando';

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!puedeEnviar) return;
		onSubmit();
	}

	return (
		<div className="mx-auto w-full max-w-3xl">
			<div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
				<form className="space-y-5" onSubmit={handleSubmit}>
					<div className="space-y-3">
						<ProgresoContratacion currentStep={4} />
						<div className="text-center">
							<h3
								className="text-xl font-bold text-gray-900 md:text-2xl"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								Documentación
							</h3>
							<p
								className="mt-1 text-sm text-gray-500"
								style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}
							>
								Sube una foto de tu DNI o NIE por ambas caras para completar la contratación.
							</p>
						</div>
					</div>

					{/* Zonas de subida */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<ZonaUpload
							label="Parte delantera"
							sublabel="Frente del DNI / NIE"
							icono={<IconoDNI lado="frente" />}
							file={data.frente}
							inputId="dni-frente"
							ladoEsperado="frente"
							validacion={validacionFrente}
							onChange={(file, v) => { onFrenteChange(file); setValidacionFrente(v); }}
						/>
						<ZonaUpload
							label="Parte trasera"
							sublabel="Dorso del DNI / NIE"
							icono={<IconoDNI lado="dorso" />}
							file={data.dorso}
							inputId="dni-dorso"
							ladoEsperado="dorso"
							validacion={validacionDorso}
							onChange={(file, v) => { onDorsoChange(file); setValidacionDorso(v); }}
						/>
					</div>

					{/* Checkbox de autorización */}
					<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 px-4 py-4 transition-colors hover:border-[#00bf63]/40">
						<input
							type="checkbox"
							required
							checked={data.autorizado}
							onChange={(e) => onAutorizadoChange(e.target.checked)}
							className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#00bf63] focus:ring-[#00bf63]/30"
						/>
						<span
							className="text-sm text-gray-700 leading-snug"
							style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}
						>
							<span className="font-semibold text-gray-900">Declaro y confirmo</span> que soy la persona titular del suministro o cuento con autorización expresa para realizar este cambio de comercializadora en su nombre, y que los datos facilitados son verídicos. Entiendo que este consentimiento queda registrado como comprobante del proceso de contratación.
						</span>
					</label>

					{/* Error de envío */}
					{errorEnvio && (
						<div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
							{errorEnvio}
						</div>
					)}

					{/* Botones */}
					<div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row">
						<button
							type="button"
							onClick={onBack}
							disabled={enviando}
							className="rounded-full border border-gray-200 bg-white px-8 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200/60 disabled:opacity-50 md:px-12 md:py-4 md:text-lg"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Atrás
						</button>
						<button
							type="submit"
							disabled={enviando || !puedeEnviar}
							className="rounded-full bg-[#00bf63] px-8 py-3 text-base font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 disabled:opacity-50 disabled:cursor-not-allowed md:px-12 md:py-4 md:text-lg"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							{enviando ? 'Enviando contrato…' : 'Finalizar contratación'}
						</button>
					</div>

					<p
						className="text-center text-xs text-gray-400"
						style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}
					>
						🔒 Tus documentos se envían cifrados y se usan exclusivamente para tramitar el cambio de comercializadora.
					</p>
				</form>
			</div>
		</div>
	);
};

export default PasoDNI;
