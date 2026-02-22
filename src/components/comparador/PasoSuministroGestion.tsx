import React, { type FC } from 'react';
import ProgresoContratacion from './ProgresoContratacion';

export interface SuministroGestionFormData {
	calle: string;
	numero: string;
	piso: string;
	letra: string;
	comunidadAutonoma: string;
	ciudad: string;
	cups: string;
	potenciaContratadap2: string;
	potenciaContratadap1: string;
	companiaActual: string;
	tipoGestion: 'cambio_compania' | 'cambio_titular';
}

interface PasoSuministroGestionProps {
	data: SuministroGestionFormData;
	onFieldChange: (field: keyof SuministroGestionFormData, value: string) => void;
	onBack: () => void;
	onSubmit: () => void;
}

const inputBaseClassName =
	'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#00bf63] focus:outline-none focus:ring-2 focus:ring-[#00bf63]/20';

const radioBaseClassName =
	'h-4 w-4 border-gray-300 text-[#00bf63] focus:ring-[#00bf63]/30';

const PasoSuministroGestion: FC<PasoSuministroGestionProps> = ({
	data,
	onFieldChange,
	onBack,
	onSubmit,
}) => {
	return (
		<div className="mx-auto w-full max-w-3xl">
			<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 lg:p-10">
				<form
					className="space-y-8"
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
					<div className="space-y-5">
						<ProgresoContratacion currentStep={2} />
						<div className="text-center">
							<h3
								className="text-xl font-bold text-gray-900 md:text-2xl"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								Datos Suministro
							</h3>
						</div>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="calle">
									Calle
								</label>
								<input
									id="calle"
									name="calle"
									type="text"
									required
									className={inputBaseClassName}
									value={data.calle}
									onChange={(event) => onFieldChange('calle', event.target.value)}
									placeholder="Nombre de la calle"
								/>
							</div>
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="numero">
									Numero
								</label>
								<input
									id="numero"
									name="numero"
									type="text"
									required
									className={inputBaseClassName}
									value={data.numero}
									onChange={(event) => onFieldChange('numero', event.target.value)}
									placeholder="13"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="piso">
									Piso
								</label>
								<input
									id="piso"
									name="piso"
									type="text"
									className={inputBaseClassName}
									value={data.piso}
									onChange={(event) => onFieldChange('piso', event.target.value)}
									placeholder="3"
								/>
							</div>
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="letra">
									Letra
								</label>
								<input
									id="letra"
									name="letra"
									type="text"
									className={inputBaseClassName}
									value={data.letra}
									onChange={(event) => onFieldChange('letra', event.target.value)}
									placeholder="B"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div>
								<label
									className="mb-2 block text-sm font-medium text-gray-700"
									htmlFor="comunidadAutonoma"
								>
									Comunidad autonoma
								</label>
								<input
									id="comunidadAutonoma"
									name="comunidadAutonoma"
									type="text"
									required
									className={inputBaseClassName}
									value={data.comunidadAutonoma}
									onChange={(event) =>
										onFieldChange('comunidadAutonoma', event.target.value)
									}
									placeholder="Cataluna"
								/>
							</div>
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="ciudad">
									Ciudad
								</label>
								<input
									id="ciudad"
									name="ciudad"
									type="text"
									required
									className={inputBaseClassName}
									value={data.ciudad}
									onChange={(event) => onFieldChange('ciudad', event.target.value)}
									placeholder="Barcelona"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="cups">
									CUPS
								</label>
								<input
									id="cups"
									name="cups"
									type="text"
									required
									className={inputBaseClassName}
									value={data.cups}
									onChange={(event) => onFieldChange('cups', event.target.value)}
									placeholder="ES00..."
								/>
							</div>
							<div>
								<label
									className="mb-2 block text-sm font-medium text-gray-700"
									htmlFor="companiaActual"
								>
									Compañia actual
								</label>
								<input
									id="companiaActual"
									name="companiaActual"
									type="text"
									required
									className={inputBaseClassName}
									value={data.companiaActual}
									onChange={(event) => onFieldChange('companiaActual', event.target.value)}
									placeholder="Tu compania actual"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div>
								<label
									className="mb-2 block text-sm font-medium text-gray-700"
									htmlFor="potenciaContratadap2"
								>
									Potencia valle
								</label>
								<input
									id="potenciaContratadap2"
									name="potenciaContratadap2"
									type="text"
									required
									className={inputBaseClassName}
									value={data.potenciaContratadap2}
									onChange={(event) =>
										onFieldChange('potenciaContratadap2', event.target.value)
									}
									placeholder="0.0"
								/>
							</div>
							<div>
								<label
									className="mb-2 block text-sm font-medium text-gray-700"
									htmlFor="potenciaContratadap1"
								>
									Potencia punta
								</label>
								<input
									id="potenciaContratadap1"
									name="potenciaContratadap1"
									type="text"
									required
									className={inputBaseClassName}
									value={data.potenciaContratadap1}
									onChange={(event) =>
										onFieldChange('potenciaContratadap1', event.target.value)
									}
									placeholder="0.0"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-5 border-t border-gray-100 pt-8">
						<div className="text-center">
							<h3
								className="text-xl font-bold text-gray-900 md:text-2xl"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								Eleccion de gestion
							</h3>
						</div>

						<fieldset>
							<legend className="sr-only">Selecciona una opcion de gestion</legend>
							<div className="space-y-4">
								<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-[#00bf63]/40">
									<input
										type="radio"
										name="tipoGestion"
										value="cambio_compania"
										checked={data.tipoGestion === 'cambio_compania'}
										onChange={(event) => onFieldChange('tipoGestion', event.target.value)}
										className={radioBaseClassName}
										required
									/>
									<span className="text-sm font-medium text-gray-800 md:text-base">
										Cambio de compañia
									</span>
								</label>

								<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-[#00bf63]/40">
									<input
										type="radio"
										name="tipoGestion"
										value="cambio_titular"
										checked={data.tipoGestion === 'cambio_titular'}
										onChange={(event) => onFieldChange('tipoGestion', event.target.value)}
										className={radioBaseClassName}
										required
									/>
									<span className="text-sm font-medium text-gray-800 md:text-base">
										Cambio de titular
									</span>
								</label>
							</div>
						</fieldset>
					</div>

					<div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
						<button
							type="button"
							onClick={onBack}
							className="rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200/60 md:px-12 md:py-5 md:text-lg"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Atrás
						</button>
						<button
							type="submit"
							className="rounded-full bg-[#00bf63] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 md:px-12 md:py-5 md:text-lg"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Continuar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PasoSuministroGestion;
