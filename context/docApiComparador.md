# Esquema de respuestas – POST /comparador/clientes/factura

Documento de referencia para el frontend. Todas las respuestas JSON comparten la forma base:

- **Éxito**: `success: true`, `message`, `data` (objeto).
- **Fallo**: `success: false`, `message`, `data: null` (y opcionalmente `errors` o `warnings`).

---

## 1. Respuesta de éxito (200)

Se devuelve **200** cuando **al menos una** de las dos operaciones (cliente o factura) ha tenido éxito. Puede ser éxito total o parcial.

### Estructura común

```ts
{
  success: true;
  message: string;   // "Solicitud procesada correctamente." | "Solicitud procesada parcialmente."
  data: {
    cliente: ClienteResult | null;
    factura: FacturaResult | null;
    rawManifest: RawManifestRecord | null;
  };
  warnings?: Array<{ source: "cliente" | "factura"; code: string; message: string }>;
}
```

- **`warnings`**: solo presente cuando hay **éxito parcial** (una operación falló). Cada elemento indica qué falló (`source`) y el `code`/`message` del error.

### Tipos de `data`

**`data.cliente`** (si insertarCliente tuvo éxito):

```ts
{
  inserted: boolean;   // true = cliente nuevo; false = ya existía
  cliente: {
    id: number;
    nombre: string;
    telefono: string;
    fecha_creacion: string;  // ISO 8601
    email?: string | null;
  };
}
```

**`data.factura`** (si insertarFactura tuvo éxito):

```ts
{
  status: string;           // ej. "success"
  nombreProveedor: string;
  idRegistro: number;
  informacionContratacion: object | null; // estructura según esave.json
  nif: string | null;
  isCif: boolean | null;
  cupsLuz: string | null;
  informacionLuz: object | null;   // estructura según esave.json
  informacionComparativa: object | null;  // estructura según esave.json
}
```

**`data.rawManifest`** (si la factura fue exitosa y se guardó el manifest):

```ts
{
  id: number;
  source: string;        // "esave"
  event_type: string;    // "parse-energy-invoice"
  storage_bucket: string;
  storage_path: string;
  received_at: string;   // ISO 8601
}
```

### Ejemplos

**Éxito total** (cliente + factura + raw_manifest):

```json
{
  "success": true,
  "message": "Solicitud procesada correctamente.",
  "data": {
    "cliente": {
      "inserted": true,
      "cliente": {
        "id": 1,
        "nombre": "Juan",
        "telefono": "+34612345678",
        "fecha_creacion": "2025-02-05T12:00:00.000Z"
      }
    },
    "factura": {
      "status": "success",
      "nombreProveedor": "TotalEnergies",
      "idRegistro": 51609,
      "informacionContratacion": { ... },
      "nif": "60133175C",
      "isCif": false,
      "cupsLuz": "ES0031405980663017EG0F",
      "informacionLuz": { ... },
      "informacionComparativa": { ... }
    },
    "rawManifest": {
      "id": 1,
      "source": "esave",
      "event_type": "parse-energy-invoice",
      "storage_bucket": "comparador-raw",
      "storage_path": "esave/51609_1738742400000.json",
      "received_at": "2025-02-05T12:00:00.000Z"
    }
  }
}
```

**Éxito parcial** (solo factura OK; cliente falló por nombre vacío):

```json
{
  "success": true,
  "message": "Solicitud procesada parcialmente.",
  "data": {
    "cliente": null,
    "factura": { ... },
    "rawManifest": { ... }
  },
  "warnings": [
    {
      "source": "cliente",
      "code": "MISSING_NAME",
      "message": "El nombre es obligatorio."
    }
  ]
}
```

---

## 2. Respuesta de fallo (4xx / 5xx)

### 2.1 Ambas operaciones fallaron (400 / 422 / 502 / 500)

Cuando **cliente** y **factura** fallan, el cuerpo es:

```ts
{
  success: false;
  message: "No se pudo procesar la solicitud.";
  data: null;
  errors: {
    cliente: { code: string; message: string };
    factura: { code: string; message: string };
  };
}
```

El **status HTTP** suele ser el del error de factura (p. ej. 422 si la factura es inválida). Códigos posibles:

| Código (cliente)   | Código (factura)     | HTTP típico |
|-------------------|----------------------|-------------|
| MISSING_NAME      | MISSING_FILE         | 400         |
| MISSING_PHONE     | INVALID_FILE_TYPE    | 400         |
| INVALID_PHONE     | ESAVE_NO_FILES       | 422         |
| SYSTEM            | ESAVE_INVALID_INVOICE| 422         |
|                   | ESAVE_AUTH           | 502         |
|                   | ESAVE_API_ERROR      | 502         |
|                   | SYSTEM               | 500         |

Ejemplo:

```json
{
  "success": false,
  "message": "No se pudo procesar la solicitud.",
  "data": null,
  "errors": {
    "cliente": {
      "code": "INVALID_PHONE",
      "message": "Teléfono no válido."
    },
    "factura": {
      "code": "ESAVE_INVALID_INVOICE",
      "message": "La imagen adjuntada no representa una factura válida de luz o gas."
    }
  }
}
```

### 2.2 Error de autenticación (401 / 403 / 500)

Respuesta común de todos los endpoints que usan `authComparador`:

```ts
{
  success: false;
  message: string;
  data: null;
}
```

| Status | Situación                    | message |
|--------|------------------------------|--------|
| 401    | Falta header Authorization   | "Token de autorización no proporcionado." |
| 403    | Token inválido                | "Token de autorización inválido." |
| 500    | COMPARADOR_KEY no configurada | "Error de configuración del servidor." |

Ejemplo 401:

```json
{
  "success": false,
  "message": "Token de autorización no proporcionado.",
  "data": null
}
```

---

## 3. Resumen para el frontend

1. **Siempre** mirar `success` para saber si la operación global fue considerada éxito.
2. Si `success === true`:
   - Usar `data.cliente` y/o `data.factura` según lo que se necesite.
   - Si existe `warnings`, mostrar mensajes por cada `source` (`cliente` / `factura`).
3. Si `success === false`:
   - Si existe `errors`, hay errores de cliente y factura; mostrar ambos.
   - Si no hay `errors`, es error de auth o servidor; usar `message`.
4. **Status HTTP**: 200 = al menos una operación OK; 4xx/5xx = error (ambas fallaron o auth/config).
