import type { APIRoute } from 'astro';
import supabase from '../../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.BTF_ADMIN_PASSWORD;
const BUCKET = 'imagenes-promociones';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cookies = request.headers.get('cookie') ?? '';
  if (!cookies.includes(`btf_admin=${ADMIN_PASSWORD}`)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file || file.size === 0) {
    return new Response(JSON.stringify({ error: 'No se recibió ningún archivo' }), { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return new Response(JSON.stringify({ error: 'Solo se admiten imágenes' }), { status: 400 });
  }

  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return new Response(JSON.stringify({ url: publicUrl }), { status: 200 });
};
