import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const clave = import.meta.env.PUBLIC_INERGIA_CLAVE;
  const crm_id = import.meta.env.PUBLIC_INERGIA_CRM_ID;

  if (!clave || !crm_id) {
    return new Response(
      JSON.stringify({ error: 'Credenciales de INERGIA no configuradas en el servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Cuerpo de la petición inválido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
  );

  // Resolver id_producto: buscar en tarifas activo_esave=true filtrando por tarifa de acceso
  let idProducto = 0;
  const tarifaAcceso = body.tarifa as string | undefined;

  if (tarifaAcceso) {
    const { data, error } = await supabase
      .from('tarifas')
      .select('idproducto, producto')
      .eq('activo_esave', true)
      .eq('tarifa', tarifaAcceso)
      .limit(1)
      .maybeSingle();

    if (data?.idproducto) {
      idProducto = data.idproducto;
      console.log(`[inergia-submit] idproducto resuelto: ${idProducto} (producto="${data.producto}", tarifa="${tarifaAcceso}")`);
    } else {
      console.warn(`[inergia-submit] Sin coincidencia en tarifas(activo_esave=true, tarifa="${tarifaAcceso}"). Error:`, error?.message);
    }
  }

  // Limpiar campos internos antes de enviar a INERGIA
  const { electric_price_info_id: _a, plan_code: _b, provider_code: _c, ...bodyLimpio } = body;
  const payload = { ...bodyLimpio, clave, crm_id, id_producto: idProducto };

  console.log('[inergia-submit] Enviando a INERGIA. id_producto:', idProducto);

  try {
    const res = await fetch('https://inergia.app/api/newctr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log(`[inergia-submit] Respuesta ${res.status}:`, text);

    let result: Record<string, unknown>;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: result?.raw ?? result?.error ?? `INERGIA ${res.status}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[inergia-submit] Error de red:', msg);
    return new Response(
      JSON.stringify({ error: `Error de conexión con INERGIA: ${msg}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
