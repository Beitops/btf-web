import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

const SYSTEM_PROMPT = `Eres un sistema de verificación de documentos de identidad españoles.
Tu única tarea es analizar si la imagen proporcionada es un DNI o NIE español auténtico y, si lo es, determinar qué cara muestra.
Responde SIEMPRE y ÚNICAMENTE con JSON válido, sin texto adicional.`;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  console.log('[validar-dni] API key presente:', !!apiKey);

  if (!apiKey) {
    console.warn('[validar-dni] ANTHROPIC_API_KEY no configurada — modo mock activo');
    return new Response(
      JSON.stringify({ valido: true, tipo: 'mock', motivo: 'Validación omitida (ANTHROPIC_API_KEY no configurada).' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let imageBase64: string;
  let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

  try {
    const formData = await request.formData();
    const file = formData.get('imagen') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No se recibió ninguna imagen.' }), { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ valido: false, tipo: 'otro', motivo: 'Formato de archivo no soportado. Usa JPG, PNG o WEBP.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    mediaType = file.type as typeof mediaType;
    const buffer = await file.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString('base64');
  } catch {
    return new Response(JSON.stringify({ error: 'Error procesando la imagen.' }), { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `Analiza esta imagen y determina si es un DNI o NIE español válido y, si lo es, qué cara muestra.
Responde ÚNICAMENTE con este JSON (sin markdown, sin explicaciones):
{
  "valido": true | false,
  "tipo": "DNI" | "NIE" | "otro",
  "lado": "frente" | "dorso" | "otro",
  "motivo": "breve explicación en español de máximo 10 palabras"
}

Reglas:
- "valido": true si la imagen muestra claramente un DNI o NIE español (aunque esté algo inclinado o con sombras). false si es otra cosa o ilegible.
- "tipo": "DNI" o "NIE" si es un documento de identidad español, "otro" en cualquier otro caso.
- "lado": "frente" si muestra la cara delantera (tiene foto del titular, nombre, apellidos y número de documento); "dorso" si muestra la cara trasera (tiene código MRZ / banda de lectura mecánica en la parte inferior, o los datos de dirección y IDESP/CANA); "otro" si no es un DNI/NIE o no se puede determinar.
- "motivo": explicación breve en español de máximo 10 palabras.`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0]?.type === 'text' ? message.content[0].text.trim() : '';
    console.log('[validar-dni] Respuesta Claude raw:', raw);

    // Extraer JSON aunque Claude añada algún texto extra
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Respuesta sin JSON válido');

    const resultado = JSON.parse(match[0]);
    console.log('[validar-dni] Resultado parseado:', resultado);

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[validar-dni] Error Anthropic:', msg);
    return new Response(
      JSON.stringify({ valido: true, tipo: 'mock', lado: 'otro', motivo: 'No se pudo verificar automáticamente.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
