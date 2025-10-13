import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const currentLanguage = ref(localStorage.getItem('language') || 'es')

export const useLanguage = () => {
  const { locale, t } = useI18n()

  const language = computed({
    get: () => currentLanguage.value,
    set: (value) => {
      currentLanguage.value = value
      locale.value = value
      localStorage.setItem('language', value)
    }
  })

  const setLanguage = (lang) => {
    language.value = lang
  }

  const toggleLanguage = () => {
    const newLang = currentLanguage.value === 'es' ? 'en' : 'es'
    setLanguage(newLang)
  }

  
  if (locale.value !== currentLanguage.value) {
    locale.value = currentLanguage.value
  }

  return {
    language,
    setLanguage,
    toggleLanguage,
    t
  }
}