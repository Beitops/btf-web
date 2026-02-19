import React, { type FC } from 'react';

const BonoSocial: FC = () => {
	return (
		<div className="mx-auto w-full max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center shadow-sm md:p-8">
			<p className="text-xl font-semibold text-blue-900">Detectamos bono social</p>
			<p className="mt-2 text-sm text-blue-800">
				Estamos preparando una comparativa adaptada a tu caso con bono social.
			</p>
		</div>
	);
};

export default BonoSocial;
