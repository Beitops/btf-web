import React, { type FC } from 'react';
import type { FacturaData, SavingCalculation } from '../../types/factura';

interface AhorrableProps {
	factura: FacturaData;
	ahorroSeleccionado: SavingCalculation;
	euro: (v?: number) => string;
}

const Ahorrable: FC<AhorrableProps> = ({ factura, ahorroSeleccionado, euro }) => {
	const infoLuz = factura.informacionLuz;
	const yearlySavings = ahorroSeleccionado.yearly_savings ?? 0;

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
						<p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed lg:text-2xl">
							Has pagado{' '}
							<span
								className="font-bold text-red-600"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								{euro(infoLuz?.precioTotal ?? 0)}€
							</span>{' '}
							en tu factura con{' '}
							<span
								className="font-bold text-gray-900"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								{factura.nombreProveedor ?? 'tu compañía actual'}
							</span>
							.
						</p>
						<p className="text-lg text-gray-600">
							Esto es bastante más de lo que se paga ahora mismo en el mercado 👎🏼
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
						<p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed lg:text-2xl">
							Nuestra inteligencia artificial ha analizado tu caso y con tu consumo actual de{' '}
							<span
								className="font-bold text-gray-900"
								style={{
									fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
								}}
							>
								{infoLuz?.energiaConsumida != null
									? `${infoLuz.energiaConsumida} kWh`
									: '— kWh'}
							</span>{' '}
							podrías empezar a pagar{' '}
							<span
								className="font-bold text-[#00bf63]"
								style={{
									fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
								}}
							>
								{euro(ahorroSeleccionado.total_amount ?? 0)}€
							</span>
							.
						</p>
						{yearlySavings > 0 && (
							<div className="space-y-6">
								<div className="space-y-2">
									<p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed lg:text-2xl">
										Lo que supondría un ahorro anual de
									</p>
									<div className="flex items-baseline justify-center">
										<span
											className="text-4xl font-bold text-[#00bf63] md:text-5xl lg:text-6xl"
											style={{
												fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
											}}
										>
											{euro(yearlySavings)}€
										</span>
									</div>
								</div>
								<div className="space-y-4 pt-4">
									<p className="text-lg font-semibold text-gray-900 md:text-xl">
										¿Quieres empezar a pagar menos de una vez?
									</p>
									<button
										type="button"
										className="mx-auto rounded-full bg-[#00bf63] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 md:px-12 md:py-5"
										style={{
											fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
										}}
									>
										¡Sí, quiero pagar menos!
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Ahorrable;
