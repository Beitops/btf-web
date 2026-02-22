import React, { type FC } from 'react';
import ProgresoContratacion from './ProgresoContratacion';

export interface DireccionFacturacionData {
	calle: string;
	numero: string;
	piso: string;
	letra: string;
	comunidadAutonoma: string;
	ciudad: string;
}

export interface FinalContratacionFormData {
	iban: string;
	direccionFacturacionDiferente: boolean;
	direccionFacturacion: DireccionFacturacionData;
}

interface PasoFinalContratacionProps {
	data: FinalContratacionFormData;
	ahorroAnual: string;
	companiaElegida: string;
	onBack: () => void;
	onIbanChange: (value: string) => void;
	onDireccionFacturacionDiferenteChange: (checked: boolean) => void;
	onDireccionFacturacionFieldChange: (
		field: keyof DireccionFacturacionData,
		value: string,
	) => void;
	onSubmit: () => void;
}

const inputBaseClassName =
	'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#00bf63] focus:outline-none focus:ring-2 focus:ring-[#00bf63]/20';

const PasoFinalContratacion: FC<PasoFinalContratacionProps> = ({
	data,
	ahorroAnual,
	companiaElegida,
	onBack,
	onIbanChange,
	onDireccionFacturacionDiferenteChange,
	onDireccionFacturacionFieldChange,
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
						<ProgresoContratacion currentStep={3} />
						<div className="text-center">
							<h3
								className="text-xl font-bold text-gray-900 md:text-2xl"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								Datos Facturación
							</h3>
						</div>

						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="iban">
								IBAN
							</label>
							<input
								id="iban"
								name="iban"
								type="text"
								required
								className={inputBaseClassName}
								value={data.iban}
								onChange={(event) => onIbanChange(event.target.value)}
								placeholder="ES00 0000 0000 0000 0000 0000"
							/>
						</div>

						<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-[#00bf63]/40">
							<input
								type="checkbox"
								checked={data.direccionFacturacionDiferente}
								onChange={(event) =>
									onDireccionFacturacionDiferenteChange(event.target.checked)
								}
								className="mt-1 h-4 w-4 rounded border-gray-300 text-[#00bf63] focus:ring-[#00bf63]/30"
							/>
							<span className="text-sm font-medium text-gray-800 md:text-base">
								¿Tu dirección de facturación será diferente que la de suministro?
							</span>
						</label>

						{data.direccionFacturacionDiferente && (
							<div className="space-y-5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 md:p-5">
								<p className="text-sm font-semibold text-gray-700 md:text-base">
									Dirección de facturación
								</p>

								<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
									<div>
										<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="facturacionCalle">
											Calle
										</label>
										<input
											id="facturacionCalle"
											name="facturacionCalle"
											type="text"
											required
											className={inputBaseClassName}
											value={data.direccionFacturacion.calle}
											onChange={(event) =>
												onDireccionFacturacionFieldChange('calle', event.target.value)
											}
											placeholder="Nombre de la calle"
										/>
									</div>
									<div>
										<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="facturacionNumero">
											Número
										</label>
										<input
											id="facturacionNumero"
											name="facturacionNumero"
											type="text"
											required
											className={inputBaseClassName}
											value={data.direccionFacturacion.numero}
											onChange={(event) =>
												onDireccionFacturacionFieldChange('numero', event.target.value)
											}
											placeholder="13"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
									<div>
										<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="facturacionPiso">
											Piso
										</label>
										<input
											id="facturacionPiso"
											name="facturacionPiso"
											type="text"
											required
											className={inputBaseClassName}
											value={data.direccionFacturacion.piso}
											onChange={(event) =>
												onDireccionFacturacionFieldChange('piso', event.target.value)
											}
											placeholder="3"
										/>
									</div>
									<div>
										<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="facturacionLetra">
											Letra
										</label>
										<input
											id="facturacionLetra"
											name="facturacionLetra"
											type="text"
											required
											className={inputBaseClassName}
											value={data.direccionFacturacion.letra}
											onChange={(event) =>
												onDireccionFacturacionFieldChange('letra', event.target.value)
											}
											placeholder="B"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
									<div>
										<label
											className="mb-2 block text-sm font-medium text-gray-700"
											htmlFor="facturacionComunidadAutonoma"
										>
											Comunidad autónoma
										</label>
										<input
											id="facturacionComunidadAutonoma"
											name="facturacionComunidadAutonoma"
											type="text"
											required
											className={inputBaseClassName}
											value={data.direccionFacturacion.comunidadAutonoma}
											onChange={(event) =>
												onDireccionFacturacionFieldChange(
													'comunidadAutonoma',
													event.target.value,
												)
											}
											placeholder="Cataluna"
										/>
									</div>
									<div>
										<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="facturacionCiudad">
											Ciudad
										</label>
										<input
											id="facturacionCiudad"
											name="facturacionCiudad"
											type="text"
											required
											className={inputBaseClassName}
											value={data.direccionFacturacion.ciudad}
											onChange={(event) =>
												onDireccionFacturacionFieldChange('ciudad', event.target.value)
											}
											placeholder="Barcelona"
										/>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="rounded-2xl border border-[#00bf63]/20 bg-[#00bf63]/5 p-5 md:p-6">
						<p className="text-sm font-medium uppercase tracking-wide text-[#00a458]">
							Resumen de tu contratación
						</p>
						<div className="mt-3 space-y-2">
							<p className="text-base text-gray-700 md:text-lg">
								Compañía elegida:{' '}
								<span className="font-semibold text-gray-900">{companiaElegida}</span>
							</p>
							<p className="text-base text-gray-700 md:text-lg">
								Ahorro estimado anual:{' '}
								<span className="font-bold text-[#00a458]">{ahorroAnual}</span>
							</p>
						</div>
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
							Finalizar contratación
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PasoFinalContratacion;
