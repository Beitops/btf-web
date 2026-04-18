import React, { useState, useEffect, useRef, type FC } from 'react';
import Ahorrable from './comparador/Ahorrable';
import BonoSocial from './comparador/BonoSocial';
import ComparadorError from './comparador/Error';
import NoAhorrable from './comparador/NoAhorrable';
import YaEsCliente from './comparador/YaEsCliente';
import PasoContratacion, {
	type ContratacionFormData,
} from './comparador/PasoContratacion';
import PasoSuministroGestion, {
	type SuministroGestionFormData,
} from './comparador/PasoSuministroGestion';
import PasoFinalContratacion, {
	type DireccionFacturacionData,
	type FinalContratacionFormData,
} from './comparador/PasoFinalContratacion';
import PasoDNI, { type DniData } from './comparador/PasoDNI';
import type { ApiResponse, FacturaData, SavingCalculation } from '../types/factura';
import type { Promocion } from '../lib/promociones';
import EndesaLogo from '../assets/comercializadoras/Endesa.svg';
import IberdrolaLogo from '../assets/comercializadoras/Iberdrola.svg';
import NaturgyLogo from '../assets/comercializadoras/Naturgy.svg';
import OctopusLogo from '../assets/comercializadoras/Octopus.svg';
import RepsolLogo from '../assets/comercializadoras/Repsol.svg';
import WekiwiLogo from '../assets/comercializadoras/Wekiwi.svg';
import NeoluxLogo from '../assets/comercializadoras/Neolux.svg';
import NibaLogo from '../assets/comercializadoras/niba-logo.svg';
import facturinVideoWebm from '../assets/facturin/facturin_analizando.webm';
import facturinVideoMov from '../assets/facturin/facturin-ios.mov';
type LogoAsset = {
	src: string;
};

const providerLogoByName: Record<string, LogoAsset> = {
	Endesa: EndesaLogo,
	Iberdrola: IberdrolaLogo,
	Naturgy: NaturgyLogo,
	Octopus: OctopusLogo,
	Neolux: NeoluxLogo,
	Niba: NibaLogo,
	Repsol: RepsolLogo,
	Wekiwi: WekiwiLogo,
};

/* ─── Types ──────────────────────────────────────────────────── */

export interface DashboardProps {
	file?: File;
	nombre?: string;
	telefono?: string;
	promocion?: Promocion | null;
	onClose?: () => void;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
}

interface WizardFormData {
	contratacion: ContratacionFormData;
	suministroGestion: SuministroGestionFormData;
	finalContratacion: FinalContratacionFormData;
}

/* ─── Session persistence ────────────────────────────────────── */

const SESSION_KEY = 'btf_session';

interface ContratoActivoInfo {
	direccion: string | null;
	comerc: string | null;
}

interface PersistedSession {
	nombre: string;
	telefono: string;
	pasoWizard: 1 | 2 | 3 | 4 | 5;
	clienteInserted: boolean | null;
	contratoActivoCliente: ContratoActivoInfo | null;
	factura: FacturaData | null;
	ahorrosPositivos: SavingCalculation[];
	mejorAhorro: SavingCalculation | null;
	error: string | null;
	datosFormulario: WizardFormData;
}

function loadSession(): PersistedSession | null {
	try {
		const raw = sessionStorage.getItem(SESSION_KEY);
		return raw ? (JSON.parse(raw) as PersistedSession) : null;
	} catch {
		return null;
	}
}

function saveSession(data: PersistedSession) {
	try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}

function clearSession() {
	try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

/* ─── Helpers ────────────────────────────────────────────────── */

const euro = (v?: number) =>
	v != null
		? v.toLocaleString('es-ES', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		: '—';

const streetPrefixRegex =
	/^\s*(?:(?:c(?:\/|\.)?)|calle|cl|cll|v[ií]a|via|av(?:da)?|avenida|ps|pso|paseo|ronda|pl|plaza|camino|cmno|carretera|ctra|crta|trav(?:es[ií]a)?)\b[\s.,/-]*/i;

const normalizeStreetName = (street: string): string =>
	street.replace(streetPrefixRegex, '').replace(/\s{2,}/g, ' ').trim();

const keepLettersNumbersAndSpaces = (value: string): string =>
	value.replace(/[^0-9A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '').replace(/\s{2,}/g, ' ').trim();

const uppercaseFirstLetterIfStartsWithLetter = (value: string): string => {
	if (!value) return value;
	const firstChar = value.charAt(0);
	if (/\d/.test(firstChar)) return value;
	if (/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(firstChar)) {
		return firstChar.toUpperCase() + value.slice(1);
	}
	return value;
};

const sanitizeAddressField = (value: string): string =>
	uppercaseFirstLetterIfStartsWithLetter(keepLettersNumbersAndSpaces(value));

const getAddressText = (address: Record<string, unknown>, ...keys: string[]) => {
	for (const key of keys) {
		const value = address[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}
	return '';
};

const extractAddressObject = (rawAddress: unknown): Record<string, unknown> | null => {
	if (!rawAddress) return null;
	if (Array.isArray(rawAddress)) {
		for (const candidate of rawAddress) {
			if (candidate && typeof candidate === 'object') {
				return candidate as Record<string, unknown>;
			}
		}
		return null;
	}
	if (typeof rawAddress === 'object') return rawAddress as Record<string, unknown>;
	return null;
};

/* ─── Sub-components ─────────────────────────────────────────── */

const CloseButton: FC<{ onClick: () => void }> = ({ onClick }) => (
	<button
		type="button"
		onClick={onClick}
		className="absolute right-3 top-1 z-10 rounded-full p-2 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20 md:right-4 md:top-2"
		aria-label="Cerrar"
	>
		<svg
			className="h-6 w-6 text-gray-500"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	</button>
);

const Greeting: FC<{ nombre?: string }> = ({ nombre }) => (
	<h1
		className="text-2xl font-bold text-gray-900 md:text-3xl"
		style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
	>
		Hola, {nombre ?? 'usuario'} 👋🏼
	</h1>
);

const PasoDosHeading: FC<{ nombreProveedor: string }> = ({ nombreProveedor }) => (
	<div>
		<h2
			className="text-2xl font-bold text-gray-900 md:text-3xl"
			style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
		>
			Estás a un solo paso de ahorrar con:
		</h2>
		<div className="mt-4">
			{(() => {
				const nombreLimpio = nombreProveedor.trim();
				if (!nombreLimpio) {
					return (
						<p className="text-xl font-semibold text-gray-900 md:text-2xl">
							tu nueva compañía
						</p>
					);
				}

				const nombreFormateado =
					nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
				const logoAsset = providerLogoByName[nombreFormateado];

				if (logoAsset?.src) {
					return (
						<div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-md md:h-32 md:w-32 p-5">
							<img
								src={logoAsset.src}
								alt={`Logo de ${nombreLimpio}`}
								className="h-full w-full object-contain"
							/>
						</div>
					);
				}

				return <p className="text-xl font-semibold text-gray-900 md:text-2xl">{nombreLimpio}</p>;
			})()}
		</div>
	</div>
);

/* --- Loading ------------------------------------------------- */

const LOADING_FRASES = [
	'Leyendo tu factura…',
	'Comparando tarifas del mercado…',
	'Calculando tu ahorro potencial…',
	'Buscando la mejor oferta para ti…',
	'¡Casi listo!',
];

const LoadingView: FC = () => {
	const [fraseIndex, setFraseIndex] = useState(0);
	const [visible, setVisible] = useState(true);
	const [progress, setProgress] = useState(0);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const v = videoRef.current;
		if (v) {
			v.muted = true;
			v.play().catch(() => {});
		}
	}, []);

	useEffect(() => {
		const timer = setInterval(() => {
			setVisible(false);
			setTimeout(() => {
				setFraseIndex((prev) => (prev + 1 < LOADING_FRASES.length ? prev + 1 : prev));
				setVisible(true);
			}, 350);
		}, 2600);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const timer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 90) return prev;
				return prev + (prev < 65 ? 2.5 : 0.4);
			});
		}, 150);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-4">
			{/* Mascota Facturin */}
			<video
				ref={videoRef}
				autoPlay
				loop
				muted
				playsInline
				disablePictureInPicture
				className="h-56 w-auto md:h-72 pointer-events-none block"
			>
				<source src={facturinVideoMov} type="video/quicktime" />
				<source src={facturinVideoWebm} type="video/webm" />
			</video>

			{/* Porcentaje grande */}
			<div className="relative flex items-center justify-center">
				<span
					className="text-7xl font-extrabold tabular-nums text-gray-900 md:text-8xl"
					style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
				>
					{Math.round(progress)}
				</span>
				<span
					className="absolute -right-8 bottom-3 text-3xl font-bold text-gray-900 md:text-4xl"
					style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
				>
					%
				</span>
			</div>

			{/* Barra de progreso */}
			<div className="w-full max-w-xs space-y-3 md:max-w-sm">
				<div className="h-4 w-full overflow-hidden rounded-full bg-black/10">
					<div
						className="relative h-full overflow-hidden rounded-full"
						style={{
							width: `${progress}%`,
							background: 'linear-gradient(90deg, #00a854, #00bf63, #00d974)',
							boxShadow: '0 0 16px rgba(0,191,99,0.55)',
							transition: 'width 0.3s ease-out',
						}}
					>
						<span className="shimmer-bar absolute inset-0" />
					</div>
				</div>

				{/* Frase animada */}
				<p
					className="text-base font-semibold text-gray-800 md:text-lg"
					style={{
						fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
						opacity: visible ? 1 : 0,
						transition: 'opacity 0.35s ease',
					}}
				>
					{LOADING_FRASES[fraseIndex]}
				</p>
			</div>

			<style>{`
				.shimmer-bar::after {
					content: '';
					position: absolute;
					inset: 0;
					background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%);
					animation: shimmerSlide 1.6s infinite ease-in-out;
				}
				@keyframes shimmerSlide {
					0%   { transform: translateX(-150%); }
					100% { transform: translateX(250%); }
				}
			`}</style>
		</div>
	);
};

/* --- Error --------------------------------------------------- */

const ErrorView: FC<{ message: string }> = ({ message }) => (
	<div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
		<div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
			<svg
				className="h-10 w-10 text-red-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		</div>
		<div className="max-w-sm space-y-2">
			<p className="text-lg font-semibold text-gray-900">
				No se pudo procesar la factura
			</p>
			<p
				className="text-sm text-gray-500"
				style={{
					fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
				}}
			>
				{message}
			</p>
		</div>
	</div>
);

/* ─── Main component ─────────────────────────────────────────── */

const Dashboard: FC<DashboardProps> = ({ file, nombre, telefono, promocion, onClose, utmSource, utmMedium, utmCampaign }) => {
	const [session] = useState<PersistedSession | null>(() => loadSession());
	const [loading, setLoading] = useState(!session);
	const [error, setError] = useState<string | null>(session?.error ?? null);
	const [clienteInserted, setClienteInserted] = useState<boolean | null>(session?.clienteInserted ?? null);
	const [contratoActivoCliente, setContratoActivoCliente] = useState<ContratoActivoInfo | null>(session?.contratoActivoCliente ?? null);
	const [factura, setFactura] = useState<FacturaData | null>(session?.factura ?? null);
	const [ahorrosPositivos, setAhorrosPositivos] = useState<SavingCalculation[]>(session?.ahorrosPositivos ?? []);
	const [mejorAhorro, setMejorAhorro] = useState<SavingCalculation | null>(session?.mejorAhorro ?? null);
	const [pasoWizard, setPasoWizard] = useState<1 | 2 | 3 | 4 | 5>(session?.pasoWizard ?? 1);
	const [dniData, setDniData] = useState<DniData>({ frente: null, dorso: null, autorizado: false });
	const [enviandoInergia, setEnviandoInergia] = useState(false);
	const [errorInergia, setErrorInergia] = useState<string | null>(null);
	const [contratoCreado, setContratoCreado] = useState(false);
	const [datosFormulario, setDatosFormulario] = useState<WizardFormData>(session?.datosFormulario ?? {
		contratacion: {
			nombre: '',
			apellidos: '',
			dniNie: '',
			email: '',
			telefono: '',
		},
		suministroGestion: {
			calle: '',
			numero: '',
			piso: '',
			letra: '',
			comunidadAutonoma: '',
			ciudad: '',
			cups: '',
			potenciaContratadap2: '',
			potenciaContratadap1: '',
			companiaActual: '',
			tipoGestion: 'cambio_compania',
		},
		finalContratacion: {
			iban: '',
			direccionFacturacionDiferente: false,
			direccionFacturacion: {
				calle: '',
				numero: '',
				piso: '',
				letra: '',
				comunidadAutonoma: '',
				ciudad: '',
			},
		},
	});

	/* --- Session save on state changes --- */
	useEffect(() => {
		if (loading) return;
		saveSession({
			nombre: nombre ?? '',
			telefono: telefono ?? '',
			pasoWizard,
			clienteInserted,
			contratoActivoCliente,
			factura,
			ahorrosPositivos,
			mejorAhorro,
			error,
			datosFormulario,
		});
	}, [loading, pasoWizard, datosFormulario, factura, clienteInserted, contratoActivoCliente, error]);

	/* --- API call on mount --- */
	useEffect(() => {
		if (session) return; // State already restored from sessionStorage

		if (!file || !nombre || !telefono) {
			setLoading(false);
			setError('Datos incompletos para analizar la factura.');
			return;
		}

		const controller = new AbortController();

		const fetchFactura = async () => {
			const startTime = Date.now();
			try {
				const formData = new FormData();
				formData.append('nombre', nombre);
				formData.append('telefono', telefono);
				formData.append('file', file);
				// utm_campaign = slug de la promoción (identificador interno)
				const campaign = utmCampaign || promocion?.slug || '';
				if (campaign)   formData.append('promocion_slug', campaign);
				if (utmSource)  formData.append('utm_source', utmSource);
				if (utmMedium)  formData.append('utm_medium', utmMedium);

				const apiUrl = import.meta.env.PUBLIC_BTF_API_URL;
				const apiToken = import.meta.env.PUBLIC_BTF_API_TOKEN;

				const res = await fetch(
					`${apiUrl}comparador/clientes/factura`,
					{
						method: 'POST',
						headers: { Authorization: `Bearer ${apiToken}` },
						body: formData,
						signal: controller.signal,
					},
				);

				const json: ApiResponse = await res.json();
				console.log('[Dashboard API Response]', json);

				if (json.success && json.data?.factura) {
					const facturaResponse = json.data.factura;
					const direccionSuministroObject = extractAddressObject(
						facturaResponse.informacionContratacion?.direccionSuministro,
					);
					const calle = sanitizeAddressField(
						normalizeStreetName(
							direccionSuministroObject
								? getAddressText(direccionSuministroObject, 'street')
								: '',
						),
					);
					const numero = sanitizeAddressField(
						direccionSuministroObject
							? getAddressText(direccionSuministroObject, 'number')
							: '',
					);
					const piso = sanitizeAddressField(
						direccionSuministroObject
							? getAddressText(direccionSuministroObject, 'floor')
							: '',
					);
					const letra = sanitizeAddressField(
						direccionSuministroObject
							? getAddressText(direccionSuministroObject, 'letter')
							: '',
					);
					const comunidadAutonoma = sanitizeAddressField(
						direccionSuministroObject
							? getAddressText(direccionSuministroObject, 'state')
							: '',
					);
					const ciudad = sanitizeAddressField(
						direccionSuministroObject
							? getAddressText(direccionSuministroObject, 'city')
							: '',
					);
					const savingCalculations =
						facturaResponse.informacionComparativa?.saving_calculations ?? [];
					const positivos = savingCalculations.filter(
						(saving) => (saving.invoice_savings ?? 0) > 0,
					);
					const nombreProveedorActual = (facturaResponse.nombreProveedor ?? '')
						.trim()
						.toLowerCase();
					const positivosFiltradosPorProveedor = positivos.filter((saving) => {
						const proveedorSaving = (saving.provider_name ?? '').trim().toLowerCase();
						return proveedorSaving !== nombreProveedorActual;
					});
					const positivosOrdenados = [...positivosFiltradosPorProveedor].sort(
						(a, b) => (a.total_amount ?? Number.POSITIVE_INFINITY) - (b.total_amount ?? Number.POSITIVE_INFINITY),
					);
					const mejor =
						positivosOrdenados[0] ?? null;
					const titularFactura = facturaResponse.informacionContratacion?.titularFactura;
					const telefonoCliente = json.data?.cliente?.cliente?.telefono || telefono || '';

					setClienteInserted(json.data?.cliente?.inserted ?? null);
					setContratoActivoCliente((json.data?.cliente?.contratoActivo as ContratoActivoInfo | null) ?? null);
					setFactura(facturaResponse);
					setAhorrosPositivos(positivos);
					setMejorAhorro(mejor);
					setPasoWizard(1);
					setDatosFormulario({
						contratacion: {
							nombre: titularFactura?.name ?? '',
							apellidos: titularFactura?.surname ?? '',
							dniNie: facturaResponse.informacionContratacion?.nif ?? '',
							email: facturaResponse.informacionContratacion?.emailLead ?? '',
							telefono: telefonoCliente,
						},
						suministroGestion: {
							calle,
							numero,
							piso,
							letra,
							comunidadAutonoma,
							ciudad,
							cups:
								(facturaResponse.informacionLuz?.cups as string) ??
								facturaResponse.cupsLuz ??
								'',
							potenciaContratadap2: String(
								(facturaResponse.informacionLuz?.potenciaContratadap2 as number | string | undefined) ??
									facturaResponse.informacionLuz?.potenciaContratadaP2 ??
									'',
							),
							potenciaContratadap1: String(
								(facturaResponse.informacionLuz?.potenciaContratadap1 as number | string | undefined) ??
									facturaResponse.informacionLuz?.potenciaContratadaP1 ??
									'',
							),
							companiaActual: facturaResponse.nombreProveedor ?? '',
							tipoGestion: 'cambio_compania',
						},
						finalContratacion: {
							iban: '',
							direccionFacturacionDiferente: false,
							direccionFacturacion: {
								calle: '',
								numero: '',
								piso: '',
								letra: '',
								comunidadAutonoma: '',
								ciudad: '',
							},
						},
					});

				} else if (
					json.success &&
					json.data?.cliente &&
					json.data.cliente.inserted === false
				) {
					// Cliente ya existía en la BD con contrato activo
					setClienteInserted(false);
					setContratoActivoCliente(json.data.cliente.contratoActivo ?? null);
					setFactura(null);
					setError(null);
					setAhorrosPositivos([]);
					setMejorAhorro(null);
					setPasoWizard(1);
					// Espera mínima de 3s para que Facturin se vea bien
					const elapsed = Date.now() - startTime;
					const remaining = Math.max(0, 3000 - elapsed);
					if (remaining > 0) await new Promise<void>((r) => setTimeout(r, remaining));
				} else {
					const msg = json.errors
						? [json.errors.cliente?.message, json.errors.factura?.message]
								.filter(Boolean)
								.join(' ')
						: json.message;
					console.error('[Dashboard API Error]', msg || json.message);
					setError(msg || 'No se pudo procesar la factura.');
					setClienteInserted(null);
					setAhorrosPositivos([]);
					setMejorAhorro(null);
					setPasoWizard(1);
				}
			} catch (err: unknown) {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				console.error('[Dashboard Network Error]', (err as Error).message);
				setError('Error de conexión. Por favor, inténtalo de nuevo.');
				setClienteInserted(null);
				setAhorrosPositivos([]);
				setMejorAhorro(null);
				setPasoWizard(1);
			} finally {
				setLoading(false);
			}
		};

		fetchFactura();
		return () => controller.abort();
	}, [file, nombre, telefono, session]);

	const handleContractFieldChange = (
		field: keyof ContratacionFormData,
		value: string,
	) => {
		setDatosFormulario((previous) => ({
			...previous,
			contratacion: {
				...previous.contratacion,
				[field]: value,
			},
		}));
	};

	const handleSupplyFieldChange = (
		field: keyof SuministroGestionFormData,
		value: string,
	) => {
		const addressFields: Array<keyof SuministroGestionFormData> = [
			'calle',
			'numero',
			'piso',
			'letra',
			'comunidadAutonoma',
			'ciudad',
		];
		const nextValue =
			addressFields.includes(field) ? sanitizeAddressField(value) : value;

		setDatosFormulario((previous) => ({
			...previous,
			suministroGestion: {
				...previous.suministroGestion,
				[field]:
					field === 'tipoGestion'
						? (value as SuministroGestionFormData['tipoGestion'])
						: nextValue,
			},
		}));
	};

	const handleIbanChange = (value: string) => {
		setDatosFormulario((previous) => ({
			...previous,
			finalContratacion: {
				...previous.finalContratacion,
				iban: value,
			},
		}));
	};

	const handleBillingAddressToggle = (checked: boolean) => {
		setDatosFormulario((previous) => ({
			...previous,
			finalContratacion: {
				...previous.finalContratacion,
				direccionFacturacionDiferente: checked,
				direccionFacturacion: checked
					? previous.finalContratacion.direccionFacturacion
					: {
							calle: '',
							numero: '',
							piso: '',
							letra: '',
							comunidadAutonoma: '',
							ciudad: '',
						},
			},
		}));
	};

	const handleBillingAddressFieldChange = (
		field: keyof DireccionFacturacionData,
		value: string,
	) => {
		const nextValue =
			field === 'calle'
				? sanitizeAddressField(normalizeStreetName(value))
				: sanitizeAddressField(value);

		setDatosFormulario((previous) => ({
			...previous,
			finalContratacion: {
				...previous.finalContratacion,
				direccionFacturacion: {
					...previous.finalContratacion.direccionFacturacion,
					[field]: nextValue,
				},
			},
		}));
	};

	/* --- Base64 helper --- */
	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve((reader.result as string).split(',')[1]);
			reader.onerror = reject;
		});
	}

	/* --- INERGIA submission --- */
	async function handleSubmitDni() {
		if (!dniData.frente || !dniData.dorso || !dniData.autorizado) return;
		setEnviandoInergia(true);
		setErrorInergia(null);

		try {
			const [frenteB64, dorsoB64] = await Promise.all([
				fileToBase64(dniData.frente),
				fileToBase64(dniData.dorso),
			]);

			const c = datosFormulario.contratacion;
			const s = datosFormulario.suministroGestion;
			const f = datosFormulario.finalContratacion;

			const apellidosParts = c.apellidos.trim().split(/\s+/);
			const ape1 = apellidosParts[0] ?? '';
			const ape2 = apellidosParts.slice(1).join(' ');

			const tiposol = s.tipoGestion === 'cambio_compania' ? 'C1' : 'C1';
			const cambioTit = s.tipoGestion === 'cambio_titular' ? 'SI' : 'NO';

			const tarifaAcceso =
				(factura?.informacionLuz as any)?.peaje ||
				(factura?.informacionContratacion as any)?.tarifaLuz ||
				'';

			const body = {
				suministro: 'LUZ',
				cups: s.cups,
				// clave y crm_id los inyecta el servidor en /api/inergia-submit
				dni: c.dniNie,
				nombre: c.nombre,
				ape1,
				ape2,
				// Dirección del titular (facturación o suministro)
				calle: f.direccionFacturacionDiferente ? f.direccionFacturacion.calle : s.calle,
				numero: f.direccionFacturacionDiferente ? f.direccionFacturacion.numero : s.numero,
				escalera: '',
				planta: f.direccionFacturacionDiferente ? f.direccionFacturacion.piso : s.piso,
				puerta: f.direccionFacturacionDiferente ? f.direccionFacturacion.letra : s.letra,
				aclarador: '',
				codpostal: '',
				localidad: f.direccionFacturacionDiferente ? f.direccionFacturacion.ciudad : s.ciudad,
				// Dirección del punto de suministro (siempre la del wizard)
				calle_cups: s.calle,
				numero_cups: s.numero,
				escalera_cups: '',
				planta_cups: s.piso,
				puerta_cups: s.letra,
				aclarador_cups: '',
				codpostal_cups: '',
				localidad_cups: s.ciudad,
				telefono: '',
				movil: c.telefono,
				email: c.email,
				cambio_tit: cambioTit,
				cambio_pot: 'NO',
				permanencia: 'NO',
				facturae: '1',
				iban: f.iban,
				tarifa: tarifaAcceso,
				potencia_contratada: s.potenciaContratadap1 || '0',
				potencia_contratada_p2: s.potenciaContratadap2 || '0',
				potencia_contratada_p3: '0',
				potencia_contratada_p4: '0',
				potencia_contratada_p5: '0',
				potencia_contratada_p6: '0',
				id_producto: 0, // el servidor lo resuelve vía tarifas.idproducto
				electric_price_info_id: (mejorAhorro as any)?.electric_price_information?.id,
				plan_code: (mejorAhorro as any)?.plan_code,
				provider_code: (mejorAhorro as any)?.provider_code,
				tiposol,
				autoconsumo: 'NO',
				dni_photo_front: frenteB64,
				dni_photo_back: dorsoB64,
			};

			const res = await fetch('/api/inergia-submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const result = await res.json().catch(() => null);

			if (!res.ok) {
				throw new Error(result?.error ?? `Error ${res.status}`);
			}

			console.log('[INERGIA] Contrato creado:', result);
			clearSession();
			setContratoCreado(true);
		} catch (err: unknown) {
			console.error('[INERGIA Error]', err);
			setErrorInergia('No se pudo enviar el contrato. Por favor, inténtalo de nuevo o contacta con nosotros.');
		} finally {
			setEnviandoInergia(false);
		}
	}

	const handleClose = () => {
		clearSession();
		onClose?.();
	};

	const handleContinueContract = () => {
		setPasoWizard(3);
	};

	const handleSubmitSupply = () => {
		setPasoWizard(4);
	};

	const handleBackFromSupply = () => {
		setPasoWizard(2);
	};

	const handleBackFromFinal = () => {
		setPasoWizard(3);
	};

	const handleSubmitFinalStep = () => {
		setPasoWizard(5);
	};

	/* --- Pantalla de éxito --- */
	if (contratoCreado) {
		return (
			<div
				className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-y-auto bg-linear-to-b from-primary to-[color-mix(in_srgb,var(--color-primary)_90%,white)] px-6"
				role="dialog"
				aria-modal="true"
			>
				<div className="mx-auto w-full max-w-lg text-center space-y-6">
					{/* Icono check */}
					<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
						<svg className="h-12 w-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
						</svg>
					</div>

					{/* Texto */}
					<div className="space-y-3">
						<h2
							className="text-3xl font-bold text-gray-900 md:text-4xl"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							¡Contrato procesado con éxito!
						</h2>
						<p
							className="text-base text-gray-800 md:text-lg"
							style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}
						>
							Tu solicitud de cambio de comercializadora ha sido procesada correctamente. 
							En breve recibirás la confirmación por email con todos los detalles.
						</p>
						<p
							className="text-sm text-gray-700"
							style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}
						>
							🎉 Gracias por confiar en <strong>BajaTuFactura</strong>. Ya puedes cerrar esta página.
						</p>
					</div>

					{/* Botón cerrar */}
					{onClose && (
						<button
							onClick={handleClose}
							className="mx-auto rounded-full bg-black px-10 py-3 text-base font-bold text-primary shadow-lg transition-all hover:brightness-125 focus:outline-none focus:ring-4 focus:ring-black/20"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Cerrar
						</button>
					)}
				</div>
			</div>
		);
	}

	/* --- Render --- */
	return (
		<div
			className="fixed inset-0 z-9999 flex flex-col overflow-y-auto bg-linear-to-b from-primary to-[color-mix(in_srgb,var(--color-primary)_90%,white)]"
			role="dialog"
			aria-modal="true"
			aria-label="Dashboard de ahorro"
		>
			
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-10 md:px-8 md:py-14">
				{/* Greeting */}
				<div className="mb-8 text-center md:mb-10">
					{(pasoWizard === 2 || pasoWizard === 3 || pasoWizard === 4) && mejorAhorro ? (
						<>
							<PasoDosHeading nombreProveedor={mejorAhorro.provider_name ?? ''} />
							{promocion && (
								<div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border-2 border-black bg-black px-4 py-2 font-bold max-w-[90vw] mx-auto">
									<span className="text-sm shrink-0">🎉</span>
									<span className="uppercase tracking-wide text-white text-[10px] md:text-xs whitespace-nowrap">{promocion.nombre}</span>
									{promocion.regalo && (
										<span className="rounded-full bg-primary px-2 py-0.5 text-black font-extrabold text-[10px] md:text-xs whitespace-nowrap">{promocion.regalo}</span>
									)}
								</div>
							)}
						</>
					) : (
						<>
							<Greeting nombre={nombre} />
							{promocion && (
								<div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border-2 border-black bg-black px-4 py-2 font-bold max-w-[90vw] mx-auto">
									<span className="text-sm shrink-0">🎉</span>
									<span className="uppercase tracking-wide text-white text-[10px] md:text-xs whitespace-nowrap">{promocion.nombre}</span>
									{promocion.regalo && (
										<span className="rounded-full bg-primary px-2 py-0.5 text-black font-extrabold text-[10px] md:text-xs whitespace-nowrap">{promocion.regalo}</span>
									)}
								</div>
							)}
						</>
					)}
				</div>

				{/* Loading */}
				{loading && <LoadingView />}

				{/* Error */}
				{!loading && error && <ComparadorError/>}

				{/* Results */}
				{!loading && !error && (factura || clienteInserted === false) && (
					<>
						{clienteInserted === false ? (
							<YaEsCliente
								direccion={contratoActivoCliente?.direccion ?? null}
								comerc={contratoActivoCliente?.comerc ?? null}
							/>
						) : factura?.bonoSocial ? (
							<BonoSocial />
						) : factura && ahorrosPositivos.length > 0 && mejorAhorro ? (
							<>
								{pasoWizard === 1 ? (
									<Ahorrable
										factura={factura}
										ahorroSeleccionado={mejorAhorro}
										euro={euro}
										promocion={promocion}
										onContinue={() => setPasoWizard(2)}
									/>
								) : (
									<>
										{pasoWizard === 2 ? (
											<PasoContratacion
												data={datosFormulario.contratacion}
												onFieldChange={handleContractFieldChange}
												onSubmit={handleContinueContract}
											/>
										) : pasoWizard === 3 ? (
											<PasoSuministroGestion
												data={datosFormulario.suministroGestion}
												onFieldChange={handleSupplyFieldChange}
												onBack={handleBackFromSupply}
												onSubmit={handleSubmitSupply}
											/>
										) : pasoWizard === 4 ? (
											<PasoFinalContratacion
												data={datosFormulario.finalContratacion}
												ahorroAnual={`${euro(mejorAhorro.yearly_savings ?? 0)}€`}
												companiaElegida={
													mejorAhorro.provider_name?.trim() || 'Tu nueva compañía'
												}
												saving={mejorAhorro}
												mensajeFinal={promocion?.mensaje_final ?? null}
												onBack={handleBackFromFinal}
												onIbanChange={handleIbanChange}
												onDireccionFacturacionDiferenteChange={handleBillingAddressToggle}
												onDireccionFacturacionFieldChange={handleBillingAddressFieldChange}
												onSubmit={handleSubmitFinalStep}
											/>
										) : (
											<PasoDNI
												data={dniData}
												enviando={enviandoInergia}
												errorEnvio={errorInergia}
												onFrenteChange={(file) => setDniData((d) => ({ ...d, frente: file }))}
												onDorsoChange={(file) => setDniData((d) => ({ ...d, dorso: file }))}
												onAutorizadoChange={(checked) => setDniData((d) => ({ ...d, autorizado: checked }))}
												onBack={() => setPasoWizard(4)}
												onSubmit={handleSubmitDni}
											/>
										)}
									</>
								)}
							</>
						) : (
							<NoAhorrable factura={factura} />
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
