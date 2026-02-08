import React, { useState, useEffect, type FC } from 'react';

/* ─── Types ──────────────────────────────────────────────────── */

export interface DashboardProps {
	file?: File;
	nombre?: string;
	telefono?: string;
	onClose?: () => void;
}

interface InformacionLuz {
	validacionLuz?: string;
	cups?: string;
	peaje?: string;
	fechaInicio?: string;
	fechaFin?: string;
	diasFacturados?: number;
	energiaConsumida?: number;
	precioTotal?: number;
	consumoP1?: number;
	consumoP2?: number;
	consumoP3?: number;
	potenciaContratadaP1?: number;
	potenciaContratadaP2?: number;
	costeServicio?: number;
	discriminacionHoraria?: string;
	annual_consumption?: number;
	[key: string]: unknown;
}

interface SavingCalculation {
	provider_name?: string;
	plan_name?: string;
	invoice_savings?: number;
	yearly_savings?: number;
	total_amount?: number;
	energy_cost?: number;
	power_cost?: number;
	discount_cost?: number;
	service_cost?: number;
	[key: string]: unknown;
}

interface InformacionComparativa {
	savings_status?: string;
	electric_information?: {
		total_cost?: number;
		recalculated_total_cost?: number;
		[key: string]: unknown;
	};
	saving_calculations?: SavingCalculation[];
}

interface FacturaData {
	status?: string;
	nombreProveedor?: string;
	idRegistro?: number;
	nif?: string | null;
	isCif?: boolean | null;
	cupsLuz?: string | null;
	informacionLuz?: InformacionLuz | null;
	informacionComparativa?: InformacionComparativa | null;
}

interface ApiResponse {
	success: boolean;
	message: string;
	data: {
		cliente: unknown;
		factura: FacturaData | null;
		rawManifest: unknown;
	} | null;
	errors?: {
		cliente?: { code: string; message: string };
		factura?: { code: string; message: string };
	};
	warnings?: Array<{ source: string; code: string; message: string }>;
}

/* ─── Helpers ────────────────────────────────────────────────── */

const euro = (v?: number) =>
	v != null
		? v.toLocaleString('es-ES', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		: '—';

const fmtDate = (d?: string) => {
	if (!d) return '—';
	const p = d.split('-');
	return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
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
		className="text-3xl font-bold text-gray-900 md:text-4xl"
		style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
	>
		Hola, {nombre ?? 'usuario'}!
	</h1>
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

/* --- Stat pill inside cards ---------------------------------- */

const Stat: FC<{
	label: string;
	value: string;
	highlight?: boolean;
	large?: boolean;
}> = ({ label, value, highlight, large }) => (
	<div className="flex flex-col gap-0.5">
		<span
			className="text-xs font-medium uppercase tracking-wider text-gray-400"
			style={{
				fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
			}}
		>
			{label}
		</span>
		<span
			className={`font-bold ${large ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} ${highlight ? 'text-[#00bf63]' : 'text-gray-900'}`}
			style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
		>
			{value}
		</span>
	</div>
);

/* ─── Main component ─────────────────────────────────────────── */

const Dashboard: FC<DashboardProps> = ({ file, nombre, telefono, onClose }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [factura, setFactura] = useState<FacturaData | null>(null);

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

				const apiUrl = import.meta.env.BTF_API_URL;
				const apiToken = import.meta.env.BTF_API_TOKEN;

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
					setFactura(json.data.factura);
				} else {
					const msg = json.errors
						? [json.errors.cliente?.message, json.errors.factura?.message]
								.filter(Boolean)
								.join(' ')
						: json.message;
					console.error('[Dashboard API Error]', msg || json.message);
					setError(msg || 'No se pudo procesar la factura.');
				}
			} catch (err: unknown) {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				console.error('[Dashboard Network Error]', (err as Error).message);
				setError('Error de conexión. Por favor, inténtalo de nuevo.');
			} finally {
				setLoading(false);
			}
		};

		fetchFactura();
		return () => controller.abort();
	}, [file, nombre, telefono]);

	/* --- Derived data --- */
	const infoLuz = factura?.informacionLuz;
	const savings = factura?.informacionComparativa?.saving_calculations;
	const bestSaving =
		savings
			?.filter((s) => (s.yearly_savings ?? 0) > 0)
			.sort((a, b) => (b.yearly_savings ?? 0) - (a.yearly_savings ?? 0))[0] ??
		savings?.[0] ??
		null;

	const yearlySavings = bestSaving?.yearly_savings ?? 0;

	/* --- Render --- */
	return (
		<div
			className="fixed inset-0 z-9999 flex flex-col overflow-y-auto bg-linear-to-b from-[#fffde6] via-white to-white"
			role="dialog"
			aria-modal="true"
			aria-label="Dashboard de ahorro"
		>
			{onClose && <CloseButton onClick={onClose} />}

			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-10 md:px-8 md:py-14">
				{/* Greeting */}
				<div className="mb-8 text-center md:mb-10">
					<Greeting nombre={nombre} />
				</div>

				{/* Loading */}
				{loading && <LoadingView />}

				{/* Error */}
				{!loading && error && <ErrorView message={error} />}

				{/* Results */}
				{!loading && !error && factura && (
					<div className="flex flex-1 flex-col gap-10">
						{/* Subtitle */}
						<p
							className="text-center text-base text-gray-500 md:text-lg"
							style={{
								fontFamily:
									"var(--font-family-secondary, 'Montserrat', sans-serif)",
							}}
						>
							Este es el análisis personalizado de tu factura
						</p>

						{/* Two-column cards */}
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
							{/* ── LEFT: Tu factura actual ── */}
							<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
								{/* Card header */}
								<div className="mb-6 flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/40">
										<svg
											className="h-5 w-5 text-gray-800"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
									</div>
									<div>
										<h2
											className="text-lg font-bold text-gray-900"
											style={{
												fontFamily:
													"var(--font-primary, 'Poppins', sans-serif)",
											}}
										>
											Tu factura actual
										</h2>
										{factura.nombreProveedor && (
											<p className="text-sm text-gray-500">
												{factura.nombreProveedor}
											</p>
										)}
									</div>
								</div>

								{/* Stats grid */}
								{infoLuz ? (
									<div className="grid grid-cols-2 gap-5">
										<Stat
											label="Coste total"
											value={`${euro(infoLuz.precioTotal)} €`}
											large
										/>
										<Stat
											label="Consumo"
											value={`${infoLuz.energiaConsumida ?? '—'} kWh`}
											large
										/>
										<Stat
											label="Periodo"
											value={`${fmtDate(infoLuz.fechaInicio)} — ${fmtDate(infoLuz.fechaFin)}`}
										/>
										<Stat
											label="Días facturados"
											value={`${infoLuz.diasFacturados ?? '—'} días`}
										/>
										<Stat
											label="Potencia contratada"
											value={`${infoLuz.potenciaContratadaP1 ?? '—'} kW`}
										/>
										<Stat
											label="Tarifa"
											value={infoLuz.peaje ?? '—'}
										/>
										{(infoLuz.consumoP1 != null ||
											infoLuz.consumoP2 != null) && (
											<>
												<Stat
													label="Consumo P1 (punta)"
													value={`${euro(infoLuz.consumoP1)} kWh`}
												/>
												<Stat
													label="Consumo P2 (valle)"
													value={`${euro(infoLuz.consumoP2)} kWh`}
												/>
											</>
										)}
									</div>
								) : (
									<p className="text-sm text-gray-400">
										Información de luz no disponible
									</p>
								)}
							</div>

							{/* ── RIGHT: Tu mejor oferta ── */}
							<div className="relative overflow-hidden rounded-3xl border-2 border-[#00bf63]/30 bg-white p-6 shadow-sm md:p-8">
								{/* Accent stripe */}
								<div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#00bf63] to-[#00bf63]/50" />

								{/* Card header */}
								<div className="mb-6 flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00bf63]/15">
										<svg
											className="h-5 w-5 text-[#00bf63]"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
										</svg>
									</div>
									<div>
										<h2
											className="text-lg font-bold text-gray-900"
											style={{
												fontFamily:
													"var(--font-primary, 'Poppins', sans-serif)",
											}}
										>
											Tu mejor oferta
										</h2>
										{bestSaving?.provider_name && (
											<p className="text-sm text-[#00bf63] font-semibold">
												{bestSaving.provider_name}
											</p>
										)}
									</div>
								</div>

								{bestSaving ? (
									<div className="space-y-6">
										{/* Highlight savings */}
										<div className="rounded-2xl bg-[#00bf63]/5 p-5">
											<div className="grid grid-cols-2 gap-5">
												<Stat
													label="Ahorro anual"
													value={`${euro(bestSaving.yearly_savings)} €`}
													highlight
													large
												/>
												<Stat
													label="Ahorro por factura"
													value={`${euro(bestSaving.invoice_savings)} €`}
													highlight
													large
												/>
											</div>
										</div>

										{/* Detail stats */}
										<div className="grid grid-cols-2 gap-5">
											<Stat
												label="Nuevo total factura"
												value={`${euro(bestSaving.total_amount)} €`}
											/>
											<Stat
												label="Coste energía"
												value={`${euro(bestSaving.energy_cost)} €`}
											/>
											<Stat
												label="Coste potencia"
												value={`${euro(bestSaving.power_cost)} €`}
											/>
											{(bestSaving.service_cost ?? 0) > 0 && (
												<Stat
													label="Coste servicio"
													value={`${euro(bestSaving.service_cost)} €`}
												/>
											)}
										</div>
									</div>
								) : (
									<p className="text-sm text-gray-400">
										Información comparativa no disponible
									</p>
								)}
							</div>
						</div>

						{/* ── CTA Section ── */}
						{bestSaving && yearlySavings > 0 && (
							<div className="mt-4 flex flex-col items-center gap-6 rounded-3xl bg-linear-to-br from-gray-50 to-white px-6 py-10 text-center md:py-12">
								<p
									className="text-xl font-bold text-gray-900 md:text-2xl"
									style={{
										fontFamily:
											"var(--font-primary, 'Poppins', sans-serif)",
									}}
								>
									¿Quieres empezar a ahorrar{' '}
									<span className="text-[#00bf63]">
										{euro(yearlySavings)} €/año
									</span>
									?
								</p>
								<button
									type="button"
									disabled
									className="rounded-full bg-[#00bf63] px-12 py-4 text-lg font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 disabled:cursor-default"
								>
									Sí, quiero ahorrar
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
