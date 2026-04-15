import React, { type FC } from 'react';
import ProgresoContratacion from './ProgresoContratacion';

export interface ContratacionFormData {
	nombre: string;
	apellidos: string;
	dniNie: string;
	email: string;
	telefono: string;
}

interface PasoContratacionProps {
	data: ContratacionFormData;
	onFieldChange: (field: keyof ContratacionFormData, value: string) => void;
	onSubmit: () => void;
}

const inputBaseClassName =
	'w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#00bf63] focus:outline-none focus:ring-2 focus:ring-[#00bf63]/20';

const PasoContratacion: FC<PasoContratacionProps> = ({ data, onFieldChange, onSubmit }) => {
	return (
		<div className="mx-auto w-full max-w-3xl">
			<div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-6 lg:p-8">
				<div className="mb-4 space-y-3">
					<ProgresoContratacion currentStep={1} />
					<div className="text-center">
						<h3
							className="text-xl font-bold text-gray-900 md:text-2xl"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Titular
						</h3>
					</div>
					<p
						className="text-center text-sm text-gray-500 md:text-base"
						style={{
							fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
						}}
					>
						Revisa tus datos para continuar la contratación.
					</p>
				</div>

				<form
					className="space-y-3"
					onSubmit={(event) => {
						event.preventDefault();
						const form = event.currentTarget;
						if (!form.checkValidity()) {
							form.reportValidity();
							return;
						}
						onSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="nombre">
								Nombre
							</label>
							<input
								id="nombre"
								name="nombre"
								type="text"
								required
								autoComplete="given-name"
								className={inputBaseClassName}
								value={data.nombre}
								onChange={(event) => onFieldChange('nombre', event.target.value)}
								placeholder="Tu nombre"
							/>
						</div>
						<div>
							<label
								className="mb-1 block text-sm font-medium text-gray-700"
								htmlFor="apellidos"
							>
								Apellidos
							</label>
							<input
								id="apellidos"
								name="apellidos"
								type="text"
								required
								autoComplete="family-name"
								className={inputBaseClassName}
								value={data.apellidos}
								onChange={(event) => onFieldChange('apellidos', event.target.value)}
								placeholder="Tus apellidos"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="dniNie">
								DNI/NIE
							</label>
							<input
								id="dniNie"
								name="dniNie"
								type="text"
								required
								autoComplete="off"
								className={inputBaseClassName}
								value={data.dniNie}
								onChange={(event) => onFieldChange('dniNie', event.target.value)}
								placeholder="12345678A"
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="telefono">
								Teléfono
							</label>
							<input
								id="telefono"
								name="telefono"
								type="tel"
								required
								autoComplete="tel"
								className={inputBaseClassName}
								value={data.telefono}
								onChange={(event) => onFieldChange('telefono', event.target.value)}
								placeholder="+34 600 000 000"
							/>
						</div>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
							Email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							autoComplete="email"
							className={inputBaseClassName}
							value={data.email}
							onChange={(event) => onFieldChange('email', event.target.value)}
							placeholder="tuemail@dominio.com"
						/>
					</div>

					<div className="pt-1 text-center space-y-2">
						<button
							type="submit"
							className="mx-auto rounded-full bg-[#00bf63] px-8 py-3 text-base font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 md:px-12 md:py-4 md:text-lg"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Continuar contratación
						</button>
						<p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}>
							🔒 Tus datos están protegidos con cifrado de extremo a extremo
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PasoContratacion;
