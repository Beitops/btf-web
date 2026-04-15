import supabase from './supabase';

export interface Promocion {
  id: number;
  slug: string;          // coincide con utm_campaign
  nombre: string;
  descripcion: string | null;
  regalo: string | null;
  activa: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  creada_en: string;
  utm_source: string | null;
  utm_medium: string | null;
}

/**
 * Obtiene una promoción activa por su slug (= utm_campaign).
 * Devuelve null si no existe, está inactiva o ha caducado.
 */
export async function getPromocionBySlug(slug: string): Promise<Promocion | null> {
  const ahora = new Date().toISOString();

  const { data, error } = await supabase
    .from('promociones')
    .select('*')
    .eq('slug', slug)
    .eq('activa', true)
    .or(`fecha_fin.is.null,fecha_fin.gte.${ahora}`)
    .maybeSingle();

  if (error) {
    console.error('[getPromocionBySlug] Error:', error);
    return null;
  }

  return data ?? null;
}

/**
 * Obtiene una promoción por slug sin filtrar por activa ni fecha.
 * Útil para detectar si una promoción existe pero ha expirado.
 */
export async function getPromocionBySlugCualquiera(slug: string): Promise<Promocion | null> {
  const { data, error } = await supabase
    .from('promociones')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[getPromocionBySlugCualquiera] Error:', error);
    return null;
  }

  return data ?? null;
}

/**
 * Obtiene todas las promociones (para el panel admin).
 */
export async function getAllPromociones(): Promise<Promocion[]> {
  const { data, error } = await supabase
    .from('promociones')
    .select('*')
    .order('creada_en', { ascending: false });

  if (error) {
    console.error('[getAllPromociones] Error:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Crea una nueva promoción.
 */
export async function crearPromocion(
  payload: Omit<Promocion, 'id' | 'creada_en'>
): Promise<Promocion | null> {
  const { data, error } = await supabase
    .from('promociones')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[crearPromocion] Error:', error);
    return null;
  }

  return data;
}

/**
 * Elimina una promoción.
 */
export async function eliminarPromocion(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('promociones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[eliminarPromocion] Error:', error);
    return false;
  }
  return true;
}

/**
 * Actualiza una promoción existente.
 */
export async function actualizarPromocion(
  id: number,
  payload: Partial<Omit<Promocion, 'id' | 'creada_en'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('promociones')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[actualizarPromocion] Error:', error);
    return false;
  }

  return true;
}
