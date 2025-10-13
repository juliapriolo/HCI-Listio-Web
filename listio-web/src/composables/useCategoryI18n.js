import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'


export const useCategoryI18n = () => {
  const { t } = useLanguage()

  const getCategoryDisplayName = (cat) => {
    if (!cat) return t('common.noCategory')
    const id = cat.id || cat
    const name = cat.name || ''
    // If category has an id like 'cat-*', prefer i18n key mapping
    if (typeof id === 'string' && id.startsWith('cat-')) {
      const key = `pages.categories.${id}`
      const translated = t(key)
      if (translated && translated !== key) return translated
    }
    
    if (name) {
      const normalized = name.toString().trim().toLowerCase()
      const NAME_TO_ID = {
        
        'frutas y verduras': 'cat-fruits',
        'lácteos': 'cat-dairy',
        'lacteos': 'cat-dairy',
        'carnes y pescados': 'cat-meat',
        'panadería': 'cat-bakery',
        'panaderia': 'cat-bakery',
        'bebidas': 'cat-beverages',
        'snacks y dulces': 'cat-snacks',
        'enlatados y conservas': 'cat-canned',
        'congelados': 'cat-frozen',
        'limpieza': 'cat-cleaning',
        'cuidado personal': 'cat-personal',
        'bebé': 'cat-baby',
        'bebe': 'cat-baby',
        'mascotas': 'cat-pets',
        'otros': 'cat-other',
        
        'fruits and vegetables': 'cat-fruits',
        'dairy': 'cat-dairy',
        'meat and fish': 'cat-meat',
        'bakery': 'cat-bakery',
        'beverages': 'cat-beverages',
        'snacks and sweets': 'cat-snacks',
        'canned goods': 'cat-canned',
        'frozen': 'cat-frozen',
        'cleaning': 'cat-cleaning',
        'personal care': 'cat-personal',
        'baby': 'cat-baby',
        'pets': 'cat-pets',
        'other': 'cat-other'
      }
      const mapped = NAME_TO_ID[normalized]
      if (mapped) {
        const key = `pages.categories.${mapped}`
        const translated = t(key)
        if (translated && translated !== key) return translated
      }
    }
    
    return name || t('common.noCategory')
  }

  return { getCategoryDisplayName }
}
