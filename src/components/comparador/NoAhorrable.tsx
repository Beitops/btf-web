import React, { type FC } from 'react';

const NoAhorrable: FC = () => {
	return (
		<div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm md:p-8">
			<p className="text-xl font-semibold text-gray-900">No se ha encontrado ahorro</p>
			<p className="mt-2 text-sm text-gray-600">
				Con los datos actuales de tu factura no hemos detectado una opción con ahorro
				positivo.
			</p>
		</div>
	);
};

export default NoAhorrable;
