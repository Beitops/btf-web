import React, { type FC } from 'react';

const WHATSAPP_LINK = 'https://wa.link/cgm2ip';

const Error: FC = () => {
	return (
		<div className="flex flex-1 flex-col gap-8 md:gap-12">
			<div className="mx-auto w-full max-w-3xl space-y-8 md:space-y-10">
				<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 lg:p-10">
					<div
						className="flex flex-col items-center gap-4 space-y-2 text-center"
						style={{
							fontFamily: "var(--font-family-secondary, 'Montserrat', sans-serif)",
						}}
					>
						<p className="text-5xl md:text-6xl" aria-hidden>
							😕
						</p>
						<p
							className="text-xl font-semibold leading-relaxed text-gray-900 md:text-2xl md:leading-relaxed"
							style={{ fontFamily: "var(--font-primary, 'Poppins', sans-serif)" }}
						>
							Ups, esta vez no hemos podido leer la factura correctamente.
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							Puede ser por la foto, el formato o porque falta alguna página.
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							Si quieres, vuelve a subirla y lo intentamos otra vez.
						</p>
						<p className="text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed">
							Y si prefieres, la vemos contigo en un momento. <span className="text-3xl">👇</span>
						</p>
						<p className="text-xl text-gray-700 md:text-xl font-bold">
							¿La vemos contigo?
						</p>
						<a
							href={WHATSAPP_LINK}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 md:px-10 md:py-5"
							style={{
								fontFamily: "var(--font-primary, 'Poppins', sans-serif)",
							}}
						>
							<svg
								className="h-12 w-12 md:h-6 md:w-6"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden
							>
								<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
							</svg>
							Hablar por WhatsApp
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Error;
