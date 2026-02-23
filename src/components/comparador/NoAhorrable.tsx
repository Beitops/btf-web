import React, { type FC } from 'react';
import type { FacturaData } from '../../types/factura';

const MESES: readonly string[] = [
	'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
	'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatFechaContrato(raw: string | undefined | null): string | null {
	if (!raw || typeof raw !== 'string') return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const date = new Date(trimmed);
	if (Number.isNaN(date.getTime())) return null;
	const d = date.getDate();
	const m = date.getMonth();
	const y = date.getFullYear();
	if (m < 0 || m > 11) return null;
	return `${d} de ${MESES[m]} de ${y}`;
}

export interface NoAhorrableProps {
	factura: FacturaData | null;
}

const NoAhorrable: FC<NoAhorrableProps> = ({ factura }) => {
	const fechaFinContrato = factura?.informacionContratacion?.fechaFinContrato ?? undefined;
	const fechaFormateada = formatFechaContrato(fechaFinContrato);
	const textoHastaBold = fechaFormateada ?? 'final del contrato';

	return (
		<div className="flex flex-1 flex-col">
			<div className="mx-auto w-full max-w-3xl">
				<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 lg:p-10">
					<div
						className="flex flex-col items-center gap-5 text-center md:gap-6"
						style={{
							fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
						}}
					>
						<p className="text-5xl md:text-6xl" aria-hidden>
							😅
						</p>
						<p
							className="text-xl font-semibold leading-relaxed text-gray-900 md:text-2xl md:leading-relaxed"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Ahora mismo no podemos mejorarte el precio.
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							Tu tarifa está bien ajustada para tu consumo.
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							Además, en tu factura aparece que este precio se mantiene hasta{' '}
							<strong>{textoHastaBold}</strong>.
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							A partir de ahí, es cuando suelen cambiar condiciones.
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							Si quieres, te avisamos justo en ese momento
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							o antes si detectamos algo <strong className="font-bold text-[#00bf63]">más barato para ti</strong>.
						</p>
						<button
							type="button"
							className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#00bf63] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 md:px-10 md:py-5"
							style={{
								fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
							}}
						>
							Activar aviso
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NoAhorrable;
