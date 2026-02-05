import React, { type FC } from 'react';

export interface DashboardProps {
	file?: File;
	nombre?: string;
	telefono?: string;
	onClose?: () => void;
}

const Dashboard: FC<DashboardProps> = ({ file, nombre, telefono, onClose }) => {
	const hasData = file != null && nombre != null && telefono != null;

	return (
		<div
			className="fixed inset-0 z-9999 flex flex-col bg-white p-6"
			role="dialog"
			aria-modal="true"
			aria-label="Dashboard de ahorro"
		>
			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/20"
					aria-label="Cerrar"
				>
					<svg
						className="h-6 w-6 text-black"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			)}
			<div className="flex flex-1 flex-col items-center justify-center gap-6">
				<h1 className="text-2xl font-bold text-black">Datos recibidos</h1>
				{hasData ? (
					<div className="flex flex-col gap-2 text-left">
						<h2 className="text-lg font-semibold text-gray-800">
							Nombre: <span className="font-normal">{nombre}</span>
						</h2>
						<h2 className="text-lg font-semibold text-gray-800">
							Teléfono: <span className="font-normal">{telefono}</span>
						</h2>
						<h2 className="text-lg font-semibold text-gray-800">
							Archivo: <span className="font-normal">{file.name}</span>
						</h2>
					</div>
				) : (
					<p className="text-gray-500">No hay datos para mostrar.</p>
				)}
			</div>
		</div>
	);
};

export default Dashboard;