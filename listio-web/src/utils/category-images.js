



function slugify(value = '') {
  try {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  } catch (_) {
    return ''
  }
}

// Strict mapping: ONLY default category names are allowed. No synonyms.
// Keys are normalized (slugified) names as they appear por defecto en la app.
const DEFAULT_NAME_TO_SLUG = {
  'frutas-y-verduras': 'frutas-y-verduras',
  'lacteos': 'lacteos',
  'carnes-y-pescados': 'carnes-y-pescados',
  'panaderia': 'panaderia',
  'snacks-y-dulces': 'snacks-y-dulces',
  'enlatados-y-conservas': 'enlatados-y-conservas',
  'congelados': 'congelados',
  'cuidado-personal': 'cuidado-personal',
  'bebe': 'bebe',
  'mascotas': 'mascotas',
  'bebidas': 'bebidas',
  'limpieza': 'limpieza',
}


const CATEGORY_ID_TO_SLUG = {
  'cat-fruits': 'frutas-y-verduras',
  'cat-beverages': 'bebidas',
  'cat-canned': 'enlatados-y-conservas',
  'cat-cleaning': 'limpieza',
  'cat-pets': 'mascotas',
}


export function getDefaultCategoryImage(categoryIdOrName) {
  if (!categoryIdOrName) return ''

  // Try ID first
  const idKey = String(categoryIdOrName)
  if (CATEGORY_ID_TO_SLUG[idKey]) {
    return `/images/categories/${CATEGORY_ID_TO_SLUG[idKey]}.jpg`
  }

  // Then try by normalized name
  const nameSlug = slugify(String(categoryIdOrName))
  const target = DEFAULT_NAME_TO_SLUG[nameSlug]
  if (target) return `/images/categories/${target}.jpg`
  return ''
}

export function getDefaultCategoryImageForProduct(product) {
  if (!product) return ''
  // Prefer category name over ID (IDs suelen ser numéricos del backend)
  const name = product.category?.name
  const id = product.category?.id
  return getDefaultCategoryImage(name || id)
}

export function getDefaultCategoryImageForItem(item) {
  if (!item) return ''
  const name = item.categoryName || item.category?.name || item.category
  const id = item.categoryId || item.category?.id
  return getDefaultCategoryImage(name || id)
}


export const CATEGORY_IMAGE_DOC = `
Place your default category images in: public/images/categories

Supported default filenames (you can add more as needed):
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

You can use .png or .webp too if you prefer; just adjust the code/mapping accordingly.
`

export default getDefaultCategoryImage
