import React, { useState, useEffect, type FC } from 'react';
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
	'w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#00bf63] focus:outline-none focus:ring-2 focus:ring-[#00bf63]/20';

const inputDisabledClassName =
	'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 cursor-not-allowed select-none';

const PasoSuministroGestion: FC<PasoSuministroGestionProps> = ({
	data,
	onFieldChange,
	onBack,
	onSubmit,
}) => {
	const [showPopup, setShowPopup] = useState(true);

	useEffect(() => {
		setShowPopup(true);
	}, []);

	return (
		<div className="mx-auto w-full max-w-3xl">
			{/* Popup informativo */}
			{showPopup && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
					<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
						<div className="mb-3 text-3xl">📋</div>
						<h4
							className="mb-2 text-lg font-bold text-gray-900"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Revisa tus datos
						</h4>
						<p
							className="mb-5 text-sm text-gray-600"
							style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}
						>
							Los datos obtenidos son de la factura subida, revisa los datos por si quieres modificar.
						</p>
						<button
							type="button"
							onClick={() => setShowPopup(false)}
							className="rounded-full bg-[#00bf63] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Entendido
						</button>
					</div>
				</div>
			)}

			<div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
				<form
					className="space-y-4"
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
					<div className="space-y-3">
						<ProgresoContratacion currentStep={2} />
						<div className="text-center">
							<h3
								className="text-xl font-bold text-gray-900 md:text-2xl"
								style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
							>
								Suministro
							</h3>
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="calle">
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
								<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="numero">
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

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="piso">
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
								<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="letra">
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

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div>
								<label
									className="mb-1 block text-sm font-medium text-gray-700"
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
								<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ciudad">
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

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="cups">
									CUPS
								</label>
								<input
									id="cups"
									name="cups"
									type="text"
									required
									disabled
									className={inputDisabledClassName}
									value={data.cups}
									readOnly
								/>
							</div>
							<div>
								<label
									className="mb-1 block text-sm font-medium text-gray-700"
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

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div>
								<label
									className="mb-1 block text-sm font-medium text-gray-700"
									htmlFor="potenciaContratadap2"
								>
									Potencia valle
								</label>
								<input
									id="potenciaContratadap2"
									name="potenciaContratadap2"
									type="text"
									required
									disabled
									className={inputDisabledClassName}
									value={data.potenciaContratadap2}
									readOnly
								/>
							</div>
							<div>
								<label
									className="mb-1 block text-sm font-medium text-gray-700"
									htmlFor="potenciaContratadap1"
								>
									Potencia punta
								</label>
								<input
									id="potenciaContratadap1"
									name="potenciaContratadap1"
									type="text"
									required
									disabled
									className={inputDisabledClassName}
									value={data.potenciaContratadap1}
									readOnly
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
						<button
							type="button"
							onClick={onBack}
							className="rounded-full border border-gray-200 bg-white px-8 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200/60 md:px-12 md:py-4 md:text-lg"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Atrás
						</button>
						<button
							type="submit"
							className="rounded-full bg-[#00bf63] px-8 py-3 text-base font-bold text-white shadow-lg shadow-[#00bf63]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#00bf63]/30 md:px-12 md:py-4 md:text-lg"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Continuar
						</button>
					</div>
					<p className="text-center text-xs text-gray-400" style={{ fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)" }}>
						🔒 Tus datos están protegidos con cifrado de extremo a extremo
					</p>
				</form>
			</div>
		</div>
	);
};

export default PasoSuministroGestion;
