import supabase from './supabase';

export async function getConfig(clave: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', clave)
      .maybeSingle();
    return data?.valor !== 'false';
  } catch {
    return true; // fail open
  }
}

export async function setConfig(clave: string, valor: boolean): Promise<void> {
  await supabase
    .from('configuracion')
    .upsert({ clave, valor: String(valor) }, { onConflict: 'clave' });
}

export async function getAllConfig(): Promise<Record<string, boolean>> {
  try {
    const { data } = await supabase.from('configuracion').select('clave, valor');
    return Object.fromEntries((data ?? []).map((r: any) => [r.clave, r.valor !== 'false']));
  } catch {
    return {};
  }
}
