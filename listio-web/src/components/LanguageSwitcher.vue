<template>
  
  <div v-if="variant === 'button'" class="lang-toggle">
    <v-btn
      :variant="'text'"
      :size="size"
      :title="t('languageSwitcher.switchToSpanish')"
      :class="['lang-btn', { 'is-active': language === 'es' }]"
      @click="setLanguage('es')"
    >
      {{ t('common.spanishShort') }}
    </v-btn>
    <v-btn
      :variant="'text'"
      :size="size"
      :title="t('languageSwitcher.switchToEnglish')"
      :class="['lang-btn', { 'is-active': language === 'en' }]"
      @click="setLanguage('en')"
    >
      {{ t('common.englishShort') }}
    </v-btn>
  </div>

  
  <button
    v-else
    :class="['language-switcher', customClass]"
    @click="toggleLanguage"
    :title="tooltip"
  >
    <span class="language-switcher__icon">AZ</span>
    <span class="language-switcher__text">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  variant: {
    type: String,
    default: 'button',
    validator: value => ['button', 'custom'].includes(value)
  },
  color: {
    type: String,
    default: 'white'
  },
  buttonVariant: {
    type: String,
    default: 'outlined'
  },
  size: {
    type: String,
    default: 'default'
  },
  customClass: {
    type: String,
    default: ''
  }
})

const { language, toggleLanguage, setLanguage, t } = useLanguage()

const label = computed(() =>
  // Label for compact variant (shows target language to switch to)
  language.value === 'es' ? t('common.englishShort') : t('common.spanishShort')
)

const tooltip = computed(() =>
  language.value === 'es'
    ? t('languageSwitcher.switchToEnglish')
    : t('languageSwitcher.switchToSpanish')
)


</script>

<style scoped>
.lang-toggle {
  display: inline-flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  padding: 4px;
  backdrop-filter: saturate(160%) blur(8px);
}
.lang-btn {
  min-width: 44px;
  padding: 6px 12px !important;
  line-height: 1 !important;
  height: 28px !important;
  border-radius: 999px !important;
  background: transparent !important;
  color: #ffffff !important;
  letter-spacing: 0.5px;
  text-transform: none;
  box-shadow: none !important;
}
.lang-btn.is-active {
  background: rgba(0, 0, 0, 0.18) !important; 
}
.lang-btn:hover:not(.is-active) {
  background: rgba(255, 255, 255, 0.16) !important;
}
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.language-switcher:hover {
  background: #f5f5f5;
  border-color: #4caf50;
}

.language-switcher__icon {
  font-size: 16px;
}

.language-switcher__text {
  color: #333;
}
</style>
