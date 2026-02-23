import React, { type FC } from 'react';
import type { FacturaData, SavingCalculation } from '../../types/factura';

interface AhorrableProps {
	factura: FacturaData;
	ahorroSeleccionado: SavingCalculation;
	euro: (v?: number) => string;
	onContinue: () => void;
}

const Ahorrable: FC<AhorrableProps> = ({
	factura,
	ahorroSeleccionado,
	euro,
	onContinue,
}) => {
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
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed lg:text-3xl">
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
						<p className="text-xl text-gray-600 md:text-2xl">
							Hoy existen tarifas más bajas para tu mismo consumo.
						</p>
						<p className="text-xl text-gray-700 md:text-2xl">
							👇 Mira cuánto podrías pagar realmente.
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
						<p className="text-lg text-gray-700 md:text-xl">
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
							<p className="text-lg text-gray-700 md:text-xl">
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
						<p className="text-lg text-gray-700 md:text-xl">
							Mismo suministro. Sin cortes de luz. Y en menos de 5 minutos.
						</p>
						<div className="space-y-4 pt-4">
							<p className="text-lg font-semibold text-gray-900 md:text-xl">
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
