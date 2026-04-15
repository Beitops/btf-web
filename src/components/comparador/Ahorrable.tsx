import React, { useState, type FC } from 'react';
import type { FacturaData, SavingCalculation } from '../../types/factura';
import type { Promocion } from '../../lib/promociones';

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
							Este mes has pagado{' '}
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
								<div className="mt-3 overflow-hidden rounded-2xl border border-gray-100">
									<table className="w-full text-sm md:text-base">
										<thead>
											<tr className="border-b border-gray-100 bg-gray-50">
												<th className="px-4 py-2.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">
													Concepto
												</th>
												<th className="px-4 py-2.5 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">
													Actual
												</th>
												<th className="px-4 py-2.5 text-right font-semibold text-[#00a458] text-xs uppercase tracking-wide">
													Nuevo
												</th>
											</tr>
										</thead>
										<tbody>
											{filas.map((fila, i) => {
												const esTotal = fila.label === 'Total factura';
												return (
													<tr
														key={fila.label}
														className={[
															i < filas.length - 1 ? 'border-b border-gray-100' : '',
															esTotal ? 'bg-gray-50 font-semibold' : '',
														].join(' ')}
													>
														<td className={`px-4 py-2.5 text-left text-gray-700 ${esTotal ? 'font-semibold' : ''}`}>
															{fila.label}
														</td>
														<td className={`px-4 py-2.5 text-right text-red-500 ${esTotal ? 'font-bold' : ''}`}>
															{fila.actual != null ? `${euro(fila.actual)} €` : '—'}
														</td>
														<td className={`px-4 py-2.5 text-right text-[#00a458] ${esTotal ? 'font-bold' : ''}`}>
															{fila.nuevo != null ? `${euro(fila.nuevo)} €` : '—'}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
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
