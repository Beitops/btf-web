import { useState, useEffect, type FC, type FormEvent } from "react";

import comparador1 from "../assets/facturin/comparador1.png";
import type { Promocion } from "../lib/promociones";

export interface ComparadorIslaProps {
    file: File;
    onClose: () => void;
    onAnalyze?: (data: { file: File; nombre: string; telefono: string }) => void;
    promocion?: Promocion | null;
}

function validarTelefono(valor: string): string | null {
    const digits = valor.replace(/\s/g, '');
    if (digits.length === 0) return 'El teléfono es obligatorio.';
    if (!/^\d+$/.test(digits)) return 'Solo se admiten números.';
    if (digits.length !== 9) return `Debe tener 9 dígitos (tienes ${digits.length}).`;
    if (!/^[67]/.test(digits)) return 'Introduce un número de móvil (debe empezar por 6 o 7).';
    return null;
}

const ComparadorIsla: FC<ComparadorIslaProps> = ({
    file,
    onClose,
    onAnalyze,
    promocion,
}) => {
    const [telefonoError, setTelefonoError] = useState<string | null>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const nombre = (form.elements.namedItem("nombre") as HTMLInputElement)?.value?.trim();
        const telefonoRaw = (form.elements.namedItem("telefono") as HTMLInputElement)?.value?.trim();
        const telefono = telefonoRaw.replace(/\s/g, '');

        const error = validarTelefono(telefono);
        if (error) {
            setTelefonoError(error);
            return;
        }

        setTelefonoError(null);
        if (nombre && telefono) {
            onAnalyze?.({ file, nombre, telefono });
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="modal-overlay-in absolute inset-0 bg-black/50"
                aria-hidden
            />
            <div
                className="modal-content-in relative z-9999 w-full max-w-md rounded-3xl border border-black p-6 shadow-xl"
                style={{ backgroundColor: "var(--color-primary)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cerrar */}
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

                {/* Badge promoción */}
                {promocion && (
                    <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border-2 border-black bg-black px-4 py-1.5 font-bold max-w-full">
                        <span className="text-sm shrink-0">🎉</span>
                        <span className="uppercase tracking-wide text-white text-xs whitespace-nowrap">{promocion.nombre}</span>
                        {promocion.regalo && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-black font-extrabold text-xs whitespace-nowrap shrink-0">
                                {promocion.regalo}
                            </span>
                        )}
                    </div>
                )}

                {/* Texto + imagen */}
                <div
                    id="modal-title"
                    className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6"
                >
                    <div className="pt-7 pl-3 flex-2">
                        <p className="flex-1 min-w-0 text-center text-xl font-bold leading-tight text-black md:text-2xl md:text-left">
                        Te enviamos tu ahorro por WhatsApp</p>
                    </div>

                    <div className="shrink-0">
                        <img
                            src={typeof comparador1 === "string" ? comparador1 : comparador1.src}
                            alt=""
                            className="h-auto w-28 object-contain md:w-36"
                            width={144}
                            height={144}
                        />
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre..."
                        className="w-full rounded-2xl border border-black/20 bg-white px-4 py-3 text-black placeholder:text-black/70 focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                        autoComplete="name"
                        required
                    />
                    <div className="flex flex-col gap-1">
                        <input
                            type="tel"
                            name="telefono"
                            placeholder="Número de WhatsApp..."
                            className={`w-full rounded-2xl border px-4 py-3 text-black placeholder:text-black/70 focus:outline-none focus:ring-2 bg-white ${
                                telefonoError
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                    : 'border-black/20 focus:border-black/40 focus:ring-black/10'
                            }`}
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={9}
                            onChange={() => telefonoError && setTelefonoError(null)}
                            required
                        />
                        {telefonoError && (
                            <p className="text-xs font-medium text-red-600 px-1">
                                {telefonoError}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="mt-2 w-full rounded-2xl bg-[#5eb5e6] px-4 py-3 font-bold uppercase tracking-wide text-white shadow transition-colors hover:bg-[#4ea4d5] focus:outline-none focus:ring-2 focus:ring-black/20"
                    >
                        Analizar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComparadorIsla;
