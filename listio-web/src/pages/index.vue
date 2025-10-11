<template>
  <main class="landing">
    <div class="landing__lang">
      <LanguageSwitcher variant="button" size="small" />
    </div>
    <section class="landing__container">
      <div class="landing__content">
        <h1 class="landing__title">{{ t('landing.title') }}</h1>
        <p class="landing__subtitle">{{ t('landing.subtitle') }}</p>
        <div class="landing__actions">
          <router-link class="landing__btn landing__btn--light" to="/login">
            {{ t('landing.signIn') }}
          </router-link>
          <router-link class="landing__btn landing__btn--dark" to="/registro">
            {{ t('landing.signUp') }}
          </router-link>
        </div>
      </div>
      <figure class="landing__visual">
        <img
          class="landing__image"
          src="@/assets/shopping-bag.png"
          :alt="t('landing.imageAlt')"
        />
      </figure>
    </section>
  </main>
</template>

<script setup>
import { useLanguage } from '@/composables/useLanguage'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useLanguage()
</script>

<style scoped>
.landing {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #52be52 0%, #3fa640 100%);
  padding: 96px 32px 64px;
  box-sizing: border-box;
}

.landing__lang {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1200;
}

.landing__container {
  width: min(1120px, 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 64px;
}

.landing__content {
  flex: 1 1 0;
  max-width: 520px;
  color: #173426;
}

.landing__title {
  font-size: clamp(40px, 7vw, 56px);
  font-weight: 700;
  margin-bottom: 18px;
}

.landing__subtitle {
  font-size: clamp(18px, 3vw, 20px);
  margin-bottom: 36px;
  color: rgba(23, 52, 38, 0.85);
}

.landing__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.landing__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 17px;
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
}

.landing__btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
}

.landing__btn:active {
  transform: translateY(0);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
}

.landing__btn--light {
  color: #14442f;
  background: #ffffff;
}

.landing__btn--dark {
  color: #ffffff;
  background: #06763f;
}

.landing__visual {
  position: relative;
  margin: 0;
  flex: 1 1 0;
  display: flex;
  justify-content: flex-end;
}

.landing__image {
  position: relative;
  z-index: 1;
  width: clamp(320px, 48vw, 480px);
  max-width: 100%;
  filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.18));
}

@media (max-width: 1023px) {
  .landing {
    padding-top: 112px;
  }

  .landing__container {
    flex-direction: column;
    text-align: center;
  }

  .landing__content {
    max-width: 600px;
  }

  .landing__actions {
    justify-content: center;
  }

  .landing__visual {
    justify-content: center;
  }
}

@media (max-width: 599px) {
  .landing {
    padding: 96px 20px 48px;
  }

  .landing__btn {
    width: 100%;
  }
}
</style>
