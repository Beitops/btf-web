# BTF Web

Web pública del comparador de facturas de BajaTuFactura. Incluye el comparador interactivo, landing de promociones, panel de administración y blog.

**Stack:** Astro SSR + React + TypeScript + Tailwind CSS + Supabase + Node.js Adapter

---

## Requisitos del servidor

- **Node.js** v20 o superior
- **npm** v10 o superior (incluido con Node.js)
- Puerto **4321** disponible (configurable)

---

## Instalación en servidor nuevo

### 1. Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs
node --version  # debe mostrar v22.x.x
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/Beitops/btf-web.git
cd btf-web
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Crear el archivo de variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# WordPress (fuente del blog)
WP_URL=https://bajatufactura.es/graphql

# BTF API (comparador)
BTF_API_URL=http://localhost:3000/
BTF_API_TOKEN=tu_token_secreto
PUBLIC_BTF_API_URL=http://localhost:3000/
PUBLIC_BTF_API_TOKEN=tu_token_secreto

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key

# Panel admin
BTF_ADMIN_PASSWORD=tu_password_admin

# INERGIA CRM
PUBLIC_INERGIA_CLAVE=tu_clave_inergia
PUBLIC_INERGIA_CRM_ID=tu_crm_id

# Anthropic (validación DNI con IA)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Desarrollo

```bash
npm run dev
```

Arranca el servidor de desarrollo en `http://localhost:4321`

---

## Producción

### 1. Compilar

```bash
npm run build
```

Genera la carpeta `dist/` con el servidor Node.js standalone.

### 2. Arrancar el servidor

```bash
node dist/server/entry.mjs
```

Por defecto escucha en el puerto **4321**. Para cambiar el puerto:

```bash
PORT=3001 node dist/server/entry.mjs
```

### Opción recomendada — Con PM2

```bash
npm install -g pm2
pm2 start dist/server/entry.mjs --name btf-web
pm2 save
pm2 startup  # para que arranque automáticamente al reiniciar el servidor
```

Comandos útiles de PM2:

```bash
pm2 status         # ver estado
pm2 logs btf-web   # ver logs en tiempo real
pm2 restart btf-web # reiniciar
pm2 stop btf-web   # detener
```

### Nginx como proxy inverso (recomendado)

Para servir en el puerto 80/443 con dominio propio:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `WP_URL` | Endpoint GraphQL de WordPress (fuente del blog) |
| `BTF_API_URL` | URL de la BTF API (servidor, sin exponer al cliente) |
| `BTF_API_TOKEN` | Token de autenticación de la BTF API |
| `PUBLIC_BTF_API_URL` | URL de la BTF API (expuesta al cliente) |
| `PUBLIC_BTF_API_TOKEN` | Token de la BTF API (expuesto al cliente) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `BTF_ADMIN_PASSWORD` | Contraseña del panel `/btf-admin` |
| `PUBLIC_INERGIA_CLAVE` | Clave de la API de INERGIA CRM |
| `PUBLIC_INERGIA_CRM_ID` | ID del CRM en INERGIA |
| `ANTHROPIC_API_KEY` | API key de Anthropic (validación de DNI con Claude) |

---

## Páginas principales

| Ruta | Descripción |
|---|---|
| `/` | Home con comparador |
| `/luz` | Landing de promociones (acepta UTM params) |
| `/btf-admin` | Panel de administración de promociones |
| `/blog` | Blog (contenido de WordPress vía GraphQL) |
| `/gas` | Página de gas |
| `/internet` | Página de internet |
