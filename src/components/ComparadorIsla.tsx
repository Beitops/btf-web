import { useState, useEffect, useRef, type FC, type FormEvent } from "react";

import comparador1 from "../assets/facturin/comparador1.png";
import type { Promocion } from "../lib/promociones";

export interface ComparadorIslaProps {
    file: File;
    onClose: () => void;
    onAnalyze?: (data: { file: File; nombre: string; telefono: string }) => void;
    promocion?: Promocion | null;
    smsActivo?: boolean;
}

function validarTelefono(valor: string): string | null {
    const digits = valor.replace(/\s/g, '');
    if (digits.length === 0) return 'El teléfono es obligatorio.';
    if (!/^\d+$/.test(digits)) return 'Solo se admiten números.';
    if (digits.length !== 9) return `Debe tener 9 dígitos (tienes ${digits.length}).`;
    if (!/^[67]/.test(digits)) return 'Introduce un número de móvil (debe empezar por 6 o 7).';
    return null;
}

const API_URL = (import.meta.env.PUBLIC_BTF_API_URL ?? '').replace(/\/$/, '');
const API_KEY = import.meta.env.PUBLIC_BTF_API_TOKEN ?? '';

function formatRetry(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0 && s > 0) return `${m} min y ${s} seg`;
    if (m > 0) return `${m} min`;
    return `${s} seg`;
}

type Step = 'form' | 'otp';

const ComparadorIsla: FC<ComparadorIslaProps> = ({
    file,
    onClose,
    onAnalyze,
    promocion,
    smsActivo = true,
}) => {
    const [step, setStep] = useState<Step>('form');
    const [telefonoError, setTelefonoError] = useState<string | null>(null);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [loadingSend, setLoadingSend] = useState(false);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [retryAfter, setRetryAfter] = useState(0);
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (retryAfter <= 0) return;
        const t = setTimeout(() => setRetryAfter(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [retryAfter]);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    useEffect(() => {
        if (step === 'otp') otpRef.current?.focus();
    }, [step]);

    async function handleSubmitForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const nombreVal = (form.elements.namedItem("nombre") as HTMLInputElement)?.value?.trim();
        const telRaw = (form.elements.namedItem("telefono") as HTMLInputElement)?.value?.trim();
        const telClean = telRaw.replace(/\s/g, '');

        const error = validarTelefono(telClean);
        if (error) { setTelefonoError(error); return; }
        setTelefonoError(null);

        if (!smsActivo) {
            onAnalyze?.({ file, nombre: nombreVal, telefono: telClean });
            return;
        }

        setLoadingSend(true);
        try {
            const res = await fetch(`${API_URL}/comparador/verify/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
                body: JSON.stringify({ telefono: telClean }),
            });
            const json = await res.json();
            if (!res.ok) {
                if (json.secsLeft) setRetryAfter(json.secsLeft);
                throw new Error(json.message ?? 'Error al enviar el código.');
            }
            setRetryAfter(0);
            setNombre(nombreVal);
            setTelefono(telClean);
            setStep('otp');
        } catch (err: any) {
            setTelefonoError(err.message ?? 'No se pudo enviar el SMS. Inténtalo de nuevo.');
        } finally {
            setLoadingSend(false);
        }
    }

    async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const codigo = otpRef.current?.value?.trim() ?? '';
        if (codigo.length !== 4) { setOtpError('El código tiene 4 dígitos.'); return; }
        setOtpError(null);

        setLoadingVerify(true);
        try {
            const res = await fetch(`${API_URL}/comparador/verify/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
                body: JSON.stringify({ telefono, codigo }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message ?? 'Código incorrecto.');
            onAnalyze?.({ file, nombre, telefono });
        } catch (err: any) {
            setOtpError(err.message ?? 'Código incorrecto o caducado.');
        } finally {
            setLoadingVerify(false);
        }
    }

    async function handleResend() {
        setOtpError(null);
        try {
            const res = await fetch(`${API_URL}/comparador/verify/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
                body: JSON.stringify({ telefono }),
            });
            const json = await res.json();
            if (!res.ok) {
                if (json.secsLeft) setRetryAfter(json.secsLeft);
                setOtpError(json.message ?? 'No se pudo reenviar el código.');
            }
        } catch {
            setOtpError('No se pudo reenviar el código.');
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal-overlay-in absolute inset-0 bg-black/50" aria-hidden />
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
                    <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Badge promoción */}
                {promocion && (
                    <div className="mt-12 mb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border-2 border-black bg-black px-4 py-2 font-bold max-w-[90%] mx-auto">
                        <span className="text-sm shrink-0">🎉</span>
                        <span className="uppercase tracking-wide text-white text-[10px] md:text-xs whitespace-nowrap">{promocion.nombre}</span>
                        {promocion.regalo && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-black font-extrabold text-[10px] md:text-xs whitespace-nowrap">
                                {promocion.regalo}
                            </span>
                        )}
                    </div>
                )}

                {step === 'form' && (
                    <>
                        <div id="modal-title" className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                            <div className="pt-7 pl-3 flex-2">
                                <p className="flex-1 min-w-0 text-center text-xl font-bold leading-tight text-black md:text-2xl md:text-left">
                                    Te enviamos tu ahorro por WhatsApp
                                </p>
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

                        <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
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
                                    <p className="text-xs font-medium text-red-600 px-1">{telefonoError}</p>
                                )}
                                {retryAfter > 0 && (
                                    <p className="text-xs font-medium text-red-600 px-1">Siguiente intento en: {formatRetry(retryAfter)}.</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loadingSend}
                                className="mt-2 w-full rounded-2xl bg-[#5eb5e6] px-4 py-3 font-bold uppercase tracking-wide text-white shadow transition-colors hover:bg-[#4ea4d5] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60"
                            >
                                {loadingSend ? 'Enviando código...' : 'Analizar'}
                            </button>
                        </form>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        <div id="modal-title" className="mt-8 mb-6 text-center">
                            <p className="text-2xl font-bold text-black">Verifica tu número</p>
                            <p className="mt-2 text-sm text-black/70">
                                Hemos enviado un SMS con el código al <span className="font-semibold">+34 {telefono}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <input
                                    ref={otpRef}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="Código de 4 dígitos"
                                    className={`w-full rounded-2xl border px-4 py-3 text-center text-2xl font-bold tracking-widest text-black placeholder:text-black/30 focus:outline-none focus:ring-2 bg-white ${
                                        otpError
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                            : 'border-black/20 focus:border-black/40 focus:ring-black/10'
                                    }`}
                                    onChange={() => otpError && setOtpError(null)}
                                    required
                                />
                                {otpError && (
                                    <p className="text-xs font-medium text-red-600 px-1">{otpError}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loadingVerify}
                                className="w-full rounded-2xl bg-[#5eb5e6] px-4 py-3 font-bold uppercase tracking-wide text-white shadow transition-colors hover:bg-[#4ea4d5] focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60"
                            >
                                {loadingVerify ? 'Verificando...' : 'Confirmar'}
                            </button>
                            <div className="flex items-center justify-between text-sm text-black/60">
                                <button type="button" onClick={() => setStep('form')} className="hover:underline">
                                    ← Cambiar número
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={retryAfter > 0}
                                    className={retryAfter > 0 ? 'opacity-40 cursor-not-allowed' : 'hover:underline'}
                                >
                                    {retryAfter > 0 ? `Reenviar en ${formatRetry(retryAfter)}` : 'Reenviar código'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ComparadorIsla;
