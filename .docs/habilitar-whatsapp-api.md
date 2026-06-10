# Habilitar WhatsApp Business API

## Requisito previo

Tener una app creada en [Meta for Developers](https://developers.facebook.com/apps/)
con la capacidad de WhatsApp ya agregada.

---

## Paso 1 — Obtener el Phone Number ID

1. Ve a [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
2. Selecciona tu app (ej. "Posadas")
3. Menú izquierdo → **WhatsApp** → **Configuración de API**
4. En "Números de teléfono", copia el **ID numérico** de tu número (ej. `1234567890`)
   - Esto es el **Phone Number ID**, NO el número telefónico

---

## Paso 2 — Generar un token de acceso permanente

1. Menú izquierdo → **Sistema** (System Users)
2. Si ya existe un usuario del sistema:
   - Click **"Generar nuevo token"**
3. Si no existe:
   - Click **"Agregar"**
   - Nombre: `PosadasWhatsAppBot`
   - Rol: **Administrador**
   - Click **"Crear usuario"**
   - Luego click **"Generar nuevo token"**
4. En la ventana de generación:
   - Permisos requeridos: `whatsapp_business_messaging`, `whatsapp_business_management`
   - Selecciona la app de WhatsApp
   - Click **"Generar token"**
5. **Copia el token inmediatamente** — solo se muestra una vez

---

## Paso 3 — Actualizar `env/.env`

Reemplaza los valores existentes:

```env
WHATSAPP_PHONE_NUMBER_ID=<Phone-Number-Id-del-paso-1>
WHATSAPP_ACCESS_TOKEN=<token-del-paso-2>
```

Ejemplo:

```env
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_ACCESS_TOKEN=EAAx...token_largo...ZD
```

---

## Paso 4 — Configurar modo de operación

El sistema tiene dos flags booleanos en `env/.env`:

| Variable | `true` | `false` |
|---|---|---|
| `WHATSAPP_TEST_MODE` | Datos simulados — no envía nada | Pasa al siguiente modo |
| `WHATSAPP_SEMI_TEST_MODE` | Datos reales pero simula el envío | Envía mensajes reales |

**Para probar (sin gastar créditos):**

```env
WHATSAPP_TEST_MODE=true
WHATSAPP_SEMI_TEST_MODE=false
```

**Para producción (cuando el token funcione):**

```env
WHATSAPP_TEST_MODE=false
WHATSAPP_SEMI_TEST_MODE=false
```

---

## Paso 5 — Reiniciar el servidor

```bash
npm run dev
```

---

## Prueba

1. Ve a `/whatsapp-envioMensajes`
2. Con `WHATSAPP_TEST_MODE=true` verás un banner amarillo **"MODO DE PRUEBA"**
3. Selecciona un cliente y envía un mensaje
4. Deberías ver resultado simulado

Para probar envío real:
- Pon ambos flags en `false`
- El token debe tener saldo o estar en modo sandbox

---

## Notas importantes

- **Los tokens expiran**: los tokens de largo plazo duran ~60 días
- **Número de prueba**: Meta te da un número telefónico de prueba gratuito limitado
- **Producción**: necesitas un número verificado (con costo) y aprobación de Meta
- **Costo por mensaje**: varía según el país (Venezuela ~$0.05/msg aprox)
- **Phone Number ID ≠ número telefónico**: el ID es un número corto (ej. `1234567890`), no confundir con el número de teléfono (ej. `+584143246396`)
