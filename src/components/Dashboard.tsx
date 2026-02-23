import React, { useState, useEffect, type FC } from 'react';
import Ahorrable from './comparador/Ahorrable';
import BonoSocial from './comparador/BonoSocial';
import Error from './comparador/Error';
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
import type { ApiResponse, FacturaData, SavingCalculation } from '../types/factura';
import EndesaLogo from '../assets/comercializadoras/Endesa.svg';
import IberdrolaLogo from '../assets/comercializadoras/Iberdrola.svg';
import NaturgyLogo from '../assets/comercializadoras/Naturgy.svg';
import OctopusLogo from '../assets/comercializadoras/Octopus.svg';
import OptimusLogo from '../assets/comercializadoras/Optimus.svg';
import RepsolLogo from '../assets/comercializadoras/Repsol.svg';
import WekiwiLogo from '../assets/comercializadoras/Wekiwi.svg';

type LogoAsset = {
	src: string;
};

const providerLogoByName: Record<string, LogoAsset> = {
	Endesa: EndesaLogo,
	Iberdrola: IberdrolaLogo,
	Naturgy: NaturgyLogo,
	Octopus: OctopusLogo,
	Optimus: OptimusLogo,
	Repsol: RepsolLogo,
	Wekiwi: WekiwiLogo,
};

/* ─── Types ──────────────────────────────────────────────────── */

export interface DashboardProps {
	file?: File;
	nombre?: string;
	telefono?: string;
	onClose?: () => void;
}

interface WizardFormData {
	contratacion: ContratacionFormData;
	suministroGestion: SuministroGestionFormData;
	finalContratacion: FinalContratacionFormData;
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
		className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20 md:right-6 md:top-6"
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
						<img
							src={logoAsset.src}
							alt={`Logo de ${nombreLimpio}`}
							className="mx-auto h-12 w-auto object-contain md:h-14"
						/>
					);
				}

				return <p className="text-xl font-semibold text-gray-900 md:text-2xl">{nombreLimpio}</p>;
			})()}
		</div>
	</div>
);

/* --- Loading ------------------------------------------------- */

const LoadingView: FC = () => (
	<div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
		{/* Animated icon */}
		<div className="relative flex h-28 w-28 items-center justify-center">
			<span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
			<span className="absolute inset-2 rounded-full bg-primary/50 animate-pulse" />
			<svg
				className="relative h-12 w-12 text-gray-900"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" />
			</svg>
		</div>

		<div className="max-w-md space-y-3">
			<p
				className="text-xl font-semibold text-gray-900 md:text-2xl"
				style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
			>
				Estamos analizando el mejor precio de{' '}
				<span className="font-extrabold text-[#00bf63]">TODO</span> el mercado
			</p>
			<p
				className="text-sm text-gray-500"
				style={{
					fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
				}}
			>
				Espere unos segundos
			</p>
		</div>

		{/* Bouncing dots */}
		<div className="flex gap-2">
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className="inline-block h-3 w-3 rounded-full bg-[#00bf63]"
					style={{
						animation: 'dashboardBounce 1.4s infinite ease-in-out',
						animationDelay: `${i * 0.16}s`,
					}}
				/>
			))}
		</div>

		{/* Keyframes for dots */}
		<style>{`
			@keyframes dashboardBounce {
				0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
				40% { transform: scale(1); opacity: 1; }
			}
		`}</style>
	</div>
);

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

const Dashboard: FC<DashboardProps> = ({ file, nombre, telefono, onClose }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [clienteInserted, setClienteInserted] = useState<boolean | null>(null);
	const [factura, setFactura] = useState<FacturaData | null>(null);
	const [ahorrosPositivos, setAhorrosPositivos] = useState<SavingCalculation[]>([]);
	const [mejorAhorro, setMejorAhorro] = useState<SavingCalculation | null>(null);
	const [pasoWizard, setPasoWizard] = useState<1 | 2 | 3 | 4>(1);
	const [datosFormulario, setDatosFormulario] = useState<WizardFormData>({
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

	/* --- API call on mount --- */
	useEffect(() => {
		if (!file || !nombre || !telefono) {
			setLoading(false);
			setError('Datos incompletos para analizar la factura.');
			return;
		}

		const controller = new AbortController();

		const fetchFactura = async () => {
			try {
				const formData = new FormData();
				formData.append('nombre', nombre);
				formData.append('telefono', telefono);
				formData.append('file', file);

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
					const proveedorActualEsNaturgy = nombreProveedorActual === 'naturgy';
					const positivosFiltradosPorProveedor = positivos.filter((saving) => {
						const proveedorSaving = (saving.provider_name ?? '').trim().toLowerCase();
						return proveedorActualEsNaturgy
							? proveedorSaving !== 'naturgy'
							: proveedorSaving === 'naturgy';
					});
					const positivosOrdenados = [...positivosFiltradosPorProveedor].sort(
						(a, b) => (a.total_amount ?? Number.POSITIVE_INFINITY) - (b.total_amount ?? Number.POSITIVE_INFINITY),
					);
					const mejor =
						positivosOrdenados[0] ?? null;
					const titularFactura = facturaResponse.informacionContratacion?.titularFactura;
					const telefonoCliente = json.data?.cliente?.cliente?.telefono ?? '';

					setClienteInserted(json.data?.cliente?.inserted ?? null);
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
					// Cliente ya existía en la BD: factura viene null, no es error
					setClienteInserted(false);
					setFactura(null);
					setError(null);
					setAhorrosPositivos([]);
					setMejorAhorro(null);
					setPasoWizard(1);
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
	}, [file, nombre, telefono]);

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
		// Paso reservado para integrar el envio final de contratacion.
	};

	/* --- Render --- */
	return (
		<div
			className="fixed inset-0 z-9999 flex flex-col overflow-y-auto bg-linear-to-b from-primary to-[color-mix(in_srgb,var(--color-primary)_90%,white)]"
			role="dialog"
			aria-modal="true"
			aria-label="Dashboard de ahorro"
		>
			{onClose && <CloseButton onClick={onClose} />}

			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-10 md:px-8 md:py-14">
				{/* Greeting */}
				<div className="mb-8 text-center md:mb-10">
					{(pasoWizard === 2 || pasoWizard === 3 || pasoWizard === 4) && mejorAhorro ? (
						<PasoDosHeading nombreProveedor={mejorAhorro.provider_name ?? ''} />
					) : (
						<Greeting nombre={nombre} />
					)}
				</div>

				{/* Loading */}
				{loading && <LoadingView />}

				{/* Error */}
				{!loading && error && <Error/>}

				{/* Results */}
				{!loading && !error && (factura || clienteInserted === false) && (
					<>
						{clienteInserted === false ? (
							<YaEsCliente />
						) : factura?.informacionLuz?.validacionLuz !== 'OK' ? (
							<Error />
						) : factura?.bonoSocial ? (
							<BonoSocial />
						) : factura && ahorrosPositivos.length > 0 && mejorAhorro ? (
							<>
								{pasoWizard === 1 ? (
									<Ahorrable
										factura={factura}
										ahorroSeleccionado={mejorAhorro}
										euro={euro}
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
										) : (
											<PasoFinalContratacion
												data={datosFormulario.finalContratacion}
												ahorroAnual={`${euro(mejorAhorro.yearly_savings ?? 0)}€`}
												companiaElegida={
													mejorAhorro.provider_name?.trim() || 'Tu nueva compañía'
												}
												onBack={handleBackFromFinal}
												onIbanChange={handleIbanChange}
												onDireccionFacturacionDiferenteChange={handleBillingAddressToggle}
												onDireccionFacturacionFieldChange={handleBillingAddressFieldChange}
												onSubmit={handleSubmitFinalStep}
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
