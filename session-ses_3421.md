# Deploy client to Vercel and server to Render with previews via Replit

**Session ID:** ses_3421fa331ffepXHfW9yiU3AW1p
**Created:** 3/5/2026, 12:02:03 PM
**Updated:** 3/5/2026, 12:04:04 PM

---

## User

necesito poder dejar listo est para poder hacer despliegue en vercel del client y despliegue dell servidor en render y poder ver la preview por aqui por replit

---

## Assistant

**Tool: glob**

---

## Assistant

**Tool: read**

**Tool: read**

**Tool: read**

---

## Assistant

**Tool: glob**

**Tool: glob**

---

## Assistant

**Tool: read**

**Tool: read**

---

## Assistant

**Tool: grep**

---

## Assistant

**Tool: todowrite**

---

## Assistant

**Tool: write**

---

## Assistant

**Tool: todowrite**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: glob**

---

## Assistant

**Tool: write**

---

## Assistant

**Tool: todowrite**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: write**

---

## Assistant

**Tool: todowrite**

---

## Assistant

Listo. He preparado el proyecto para despliegue:

## Cambios realizados:

**Client (Vercel):**
- Creé `client/vercel.json` para rewrites de SPA
- Actualicé `useMultiplayer.tsx` para usar variable de entorno `VITE_API_URL`
- Creé `client/.env.example` con las variables necesarias
- Actualicé `vite.config.ts` para exponer la variable

**Server (Render):**
- Ya estaba configurado correctamente con `process.env.PORT`

---

## Pasos para desplegar:

### Render (Server):
1. Sube el código a GitHub
2. Crea un nuevo Web Service en Render
3. Configura:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `GEMINI_API_KEY` (tu key)

### Vercel (Client):
1. Ve a Vercel e importa el proyecto desde GitHub
2. En Environment Variables agrega:
   - `VITE_API_URL` = URL de tu servidor Render (ej: `https://shadowbound-server.onrender.com`)
3. Despliega

La app detectará automáticamente la URL del servidor en producción mediante la variable de entorno.

---

