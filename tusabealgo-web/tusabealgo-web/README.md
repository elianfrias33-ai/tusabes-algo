# TuSabeAlgo Shop — Catálogo web

Catálogo de [@tusabealgoshop23](https://www.instagram.com/tusabealgoshop23/) hecho con Vite + GSAP.

## Correr en tu computadora

```bash
npm install
npm run dev
```

Abre http://localhost:5184

## Desplegar en Vercel

**Opción A: desde GitHub**
1. Sube esta carpeta a un repositorio de GitHub.
2. En vercel.com → *Add New… → Project* → importa el repositorio.
3. Vercel detecta Vite solo (también lo dice `vercel.json`). Dale a *Deploy*.

**Opción B: desde la terminal**
```bash
npm install -g vercel
vercel
```
Responde las preguntas con Enter (los valores por defecto sirven). Para publicar la versión final: `vercel --prod`.

## Cambiar productos y precios

Todo está en `src/data.js`:
- `FLOWS`: los flows del catálogo (talla, precio, `sold: true` para marcar agotado).
- `LOOKS`: el lookbook.
- `BUSINESS`: número de WhatsApp y redes.

Para fotos nuevas: pon la foto en `raw/<código-del-post>.jpg`, agrégala a la lista de `scripts/optimize-images.mjs` y corre `npm run images`.
