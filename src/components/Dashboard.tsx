import React, { useState, useEffect, type FC } from 'react';
import Ahorrable from './comparador/Ahorrable';
import BonoSocial from './comparador/BonoSocial';
import NoAhorrable from './comparador/NoAhorrable';
import type { ApiResponse, FacturaData, SavingCalculation } from '../types/factura';

/* ─── Types ──────────────────────────────────────────────────── */

export interface DashboardProps {
	file?: File;
	nombre?: string;
	telefono?: string;
	onClose?: () => void;
}

/* ─── Helpers ────────────────────────────────────────────────── */

const euro = (v?: number) =>
	v != null
		? v.toLocaleString('es-ES', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		: '—';

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

/* ─── Main component ─────────────────────────────────────────── */

const Dashboard: FC<DashboardProps> = ({ file, nombre, telefono, onClose }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [factura, setFactura] = useState<FacturaData | null>(null);
	const [ahorrosPositivos, setAhorrosPositivos] = useState<SavingCalculation[]>([]);
	const [mejorAhorro, setMejorAhorro] = useState<SavingCalculation | null>(null);

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
					const savingCalculations =
						facturaResponse.informacionComparativa?.saving_calculations ?? [];
					const positivos = savingCalculations.filter(
						(saving) => (saving.invoice_savings ?? 0) > 0,
					);
					const nombreProveedorActual = (facturaResponse.nombreProveedor ?? '')
						.trim()
						.toLowerCase();
					const positivosOrdenados = [...positivos].sort(
						(a, b) => (b.invoice_savings ?? 0) - (a.invoice_savings ?? 0),
					);
					const mejor =
						positivosOrdenados.find(
							(saving) =>
								(saving.provider_name ?? '').trim().toLowerCase() !==
								nombreProveedorActual,
						) ?? null;

					setFactura(facturaResponse);
					setAhorrosPositivos(positivos);
					setMejorAhorro(mejor);
				} else {
					const msg = json.errors
						? [json.errors.cliente?.message, json.errors.factura?.message]
								.filter(Boolean)
								.join(' ')
						: json.message;
					console.error('[Dashboard API Error]', msg || json.message);
					setError(msg || 'No se pudo procesar la factura.');
					setAhorrosPositivos([]);
					setMejorAhorro(null);
				}
			} catch (err: unknown) {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				console.error('[Dashboard Network Error]', (err as Error).message);
				setError('Error de conexión. Por favor, inténtalo de nuevo.');
				setAhorrosPositivos([]);
				setMejorAhorro(null);
			} finally {
				setLoading(false);
			}
		};

		fetchFactura();
		return () => controller.abort();
	}, [file, nombre, telefono]);

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
					<>
						{factura.bonoSocial ? (
							<BonoSocial />
						) : ahorrosPositivos.length > 0 && mejorAhorro ? (
							<Ahorrable factura={factura} ahorroSeleccionado={mejorAhorro} euro={euro} />
						) : (
							<NoAhorrable />
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
