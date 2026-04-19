import React, { useState, type FC } from 'react';
import type { FacturaData, SavingCalculation } from '../../types/factura';
import type { Promocion } from '../../lib/promociones';

// Interface para ahorrable
interface AhorrableProps {
	factura: FacturaData;
	ahorroSeleccionado: SavingCalculation;
	euro: (v?: number) => string;
	promocion?: Promocion | null;
	onContinue: () => void;
}

const Ahorrable: FC<AhorrableProps> = ({
	factura,
	ahorroSeleccionado,
	euro,
	promocion,
	onContinue,
}) => {
	const [desgloseAbierto, setDesgloseAbierto] = useState(false);

	const infoLuz = factura.informacionLuz;
	const yearlySavings = ahorroSeleccionado.yearly_savings ?? 0;

	// Valores actuales — datos de ESAVE en informacionLuz
	const totalActual = infoLuz?.precioTotal ?? 0;
	const potenciaActual = infoLuz?.preciosPotencia?.reduce((s, p) => s + (p.total_cost ?? 0), 0);
	const energiaActual = infoLuz?.preciosEnergia?.reduce((s, e) => s + (e.total_cost ?? 0), 0);

	// Valores nuevos — datos del saving_calculation seleccionado
	const totalNuevo = ahorroSeleccionado.total_amount ?? 0;
	const potenciaNueva = ahorroSeleccionado.power_cost;
	const energiaNueva = ahorroSeleccionado.energy_cost;

	const filas: { label: string; actual: number | undefined; nuevo: number | undefined }[] = [
		{ label: 'Coste potencia', actual: potenciaActual, nuevo: potenciaNueva },
		{ label: 'Coste energía', actual: energiaActual, nuevo: energiaNueva },
		{ label: 'Total factura', actual: totalActual, nuevo: totalNuevo },
	];

	return (
		<div className="flex flex-1 flex-col gap-8 md:gap-12">
			<div className="mx-auto w-full max-w-3xl space-y-8 md:space-y-10">
				<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 lg:p-10">
					<div
						className="space-y-4 text-center"
						style={{
							fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
						}}
					>
						<p className="text-base leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed lg:text-3xl">
							En esta factura has pagado{' '}
							<span
								className="font-bold text-red-600"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								{euro(infoLuz?.precioTotal ?? 0)}€
							</span>{' '}
							con{' '}
							<span
								className="font-bold text-gray-900"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								{factura.nombreProveedor ?? 'tu compañía actual'}
							</span>
							.
						</p>
						<p className="text-base text-gray-600 md:text-2xl">
							Hoy existen tarifas más bajas para tu mismo consumo 👇
						</p>
					</div>
				</div>

				<div className="relative overflow-hidden rounded-3xl border-2 border-[#00bf63]/30 bg-white p-6 shadow-sm md:p-8 lg:p-10">
					<div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#00bf63] to-[#00bf63]/50" />

					<div
						className="space-y-6 text-center"
						style={{
							fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
						}}
					>
						<p className="text-sm text-gray-700 md:text-xl">
							Con tu consumo actual, podrías empezar a pagar{' '}
							<span
								className="font-bold text-gray-900 text-xl md:text-2xl"
								style={{
									fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
								}}
							>
								{euro(ahorroSeleccionado.total_amount ?? 0)} €/mes
							</span>
							.
						</p>

						<div className="space-y-3">
							<p className="text-sm text-gray-700 md:text-xl">
								Eso supone un ahorro anual aproximado de:
							</p>
							<p
								className="font-bold text-[#00bf63] text-5xl"
								style={{
									fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
								}}
							>
								{euro(yearlySavings) + ' €'}
							</p>
						</div>

						{/* Desglose de precios */}
						<div>
							<button
								type="button"
								onClick={() => setDesgloseAbierto((v) => !v)}
								className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00a458] underline-offset-2 hover:underline focus:outline-none md:text-base"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								{desgloseAbierto ? 'Ocultar desglose' : 'Ver desglose de precios'}
								<svg
									className={`h-4 w-4 transition-transform duration-200 ${desgloseAbierto ? 'rotate-180' : ''}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{desgloseAbierto && (
								<div className="mt-4 grid grid-cols-2 gap-2 md:gap-3 text-left">
									{/* Columna actual */}
									<div className="rounded-2xl border border-red-100 bg-red-50 p-3 md:p-4">
										<p className="truncate text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-red-400 mb-2 md:mb-3"
											style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}>
											{factura.nombreProveedor ?? 'Actual'}
										</p>
										<p className="text-xl md:text-2xl font-extrabold text-red-400 mb-0.5"
											style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}>
											{euro(totalActual)}<span className="text-xs md:text-sm font-semibold"> €</span>
										</p>
										<p className="text-[9px] md:text-[10px] text-red-300 mb-3 md:mb-4"
											style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}>
											este mes
										</p>
										<div className="space-y-1.5 md:space-y-2 border-t border-red-100 pt-2 md:pt-3">
											{filas.slice(0, -1).map((fila) => (
												<div key={fila.label} className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-2">
													<span className="text-[9px] md:text-xs text-red-300 leading-tight"
														style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}>
														{fila.label}
													</span>
													<span className="text-[9px] md:text-xs font-semibold text-red-400 whitespace-nowrap">
														{fila.actual != null ? `${euro(fila.actual)} €` : '—'}
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Columna nueva */}
									<div className="relative rounded-2xl border-2 border-[#00bf63] bg-[#00bf63]/5 p-3 md:p-4 shadow-md shadow-[#00bf63]/10">
										{/* Badge */}
										<div className="absolute -top-3 left-1/2 -translate-x-1/2">
											<span className="whitespace-nowrap rounded-full bg-[#00bf63] px-2 py-0.5 text-[8px] md:text-[9px] font-bold text-white shadow"
												style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}>
												MEJOR PRECIO
											</span>
										</div>
										<p className="truncate text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-[#00bf63] mb-2 md:mb-3"
											style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}>
											{ahorroSeleccionado.provider_name ?? 'Nueva tarifa'}
										</p>
										<p className="text-xl md:text-2xl font-extrabold text-[#00a458] mb-0.5"
											style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}>
											{euro(totalNuevo)}<span className="text-xs md:text-sm font-semibold"> €/mes</span>
										</p>
										<p className="text-[9px] md:text-[10px] text-[#00bf63] font-semibold mb-3 md:mb-4"
											style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}>
											~{euro(yearlySavings)} €/año menos
										</p>
										<div className="space-y-1.5 md:space-y-2 border-t border-[#00bf63]/20 pt-2 md:pt-3">
											{filas.slice(0, -1).map((fila) => (
												<div key={fila.label} className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-2">
													<span className="text-[9px] md:text-xs text-[#00a458]/70 leading-tight"
														style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}>
														{fila.label}
													</span>
													<span className="text-[9px] md:text-xs font-semibold text-[#00a458] whitespace-nowrap">
														{fila.nuevo != null ? `${euro(fila.nuevo)} €` : '—'}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="space-y-4 pt-2">
							<p className="text-sm text-gray-700 md:text-xl">
								Mismo suministro. Sin cortes de luz. Y en menos de 5 minutos.
							</p>
							<p className="text-sm font-semibold text-gray-900 md:text-xl">
								¿Empezamos a pagar menos desde la próxima factura?
							</p>
							<button
								type="button"
								onClick={onContinue}
								className="mx-auto rounded-full bg-[#00bf63] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 md:px-12 md:py-5"
								style={{
									fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
								}}
							>
								Empezar a ahorrar.
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Ahorrable;
