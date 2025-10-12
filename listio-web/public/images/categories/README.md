# Default category images

Place your images in this folder so the app can show a photo when a product/category has no custom image.

Accepted filenames (use .jpg by default):

- frutas-y-verduras.jpg
- lacteos.jpg
- carnes-y-pescados.jpg
- panaderia.jpg
- snacks-y-dulces.jpg
- enlatados-y-conservas.jpg
- congelados.jpg
- cuidado-personal.jpg
- bebe.jpg
- mascotas.jpg
- bebidas.jpg
- limpieza.jpg

Notes:
- You can use .png or .webp, but the mapping in `src/utils/category-images.js` expects `.jpg` today.
- You can add more categories/aliases by editing `src/utils/category-images.js` (CATEGORY_SLUG_ALIASES and CATEGORY_ID_TO_SLUG).
- Images are served from Vite's public folder at `/images/categories/<file>`.
