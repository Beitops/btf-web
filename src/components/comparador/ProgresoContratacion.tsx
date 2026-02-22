import React, { type FC } from 'react';

interface ProgresoContratacionProps {
	currentStep: 1 | 2 | 3;
}

const steps = [
	{ id: 1, label: 'Datos Titular' },
	{ id: 2, label: 'Datos Suministro' },
	{ id: 3, label: 'Datos Facturación' },
] as const;

const ProgresoContratacion: FC<ProgresoContratacionProps> = ({ currentStep }) => {
	const progressPercent = ((currentStep - 0.5) / steps.length) * 100;

	return (
		<div className="space-y-4">
			<div className="relative">
				<div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
				<div
					className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-linear-to-r from-[#00bf63] to-[#00d978] transition-all duration-400 ease-out"
					style={{ width: `${progressPercent}%` }}
				/>

				<div className="relative grid grid-cols-3 gap-2 md:gap-4">
					{steps.map((step) => {
						const isCompleted = currentStep > step.id;
						const isCurrent = currentStep === step.id;
						const isActive = isCompleted || isCurrent;

						return (
							<div key={step.id} className="flex flex-col items-center">
								<div
									className={[
										'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm transition-all duration-300',
										isActive
											? 'border-[#00bf63] bg-white text-[#00bf63]'
											: 'border-gray-300 bg-white text-gray-400',
										isCurrent ? 'ring-4 ring-[#00bf63]/20' : '',
									].join(' ')}
								>
									{isCompleted ? '✓' : step.id}
								</div>
								<p
									className={[
										'mt-2 text-center text-xs font-semibold md:text-sm',
										isActive ? 'text-gray-900' : 'text-gray-400',
									].join(' ')}
								>
									{step.label}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default ProgresoContratacion;
