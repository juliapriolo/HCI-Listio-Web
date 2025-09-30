<script setup>
import { useProfileStore } from "@/composables/useProfileStore";

const { profile } = useProfileStore();
</script>

<template>
  <main class="profile">
    <section class="profile__layout">
      <header class="profile__header">
        <h1 class="profile__title">Mi Perfil</h1>
      </header>

      <article class="profile__card">
        <div class="profile__avatar">
          <img
            v-if="profile.avatar"
            :src="profile.avatar"
            :alt="`Foto de ${profile.name}`"
            class="profile__avatar-image"
          />
          <svg v-else class="profile__avatar-icon" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="4" />
            <path
              d="M14 52c0-9.941 8.059-18 18-18s18 8.059 18 18"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="profile__identity">
          <h2 class="profile__name">{{ profile.name }}</h2>
          <p class="profile__email">{{ profile.email }}</p>
        </div>
      </article>

      <nav class="profile__actions" aria-label="Acciones de la cuenta">
        <RouterLink class="profile__action" to="/editar-perfil">
          <span>Editar Perfil</span>
          <span aria-hidden="true">&rsaquo;</span>
        </RouterLink>
        <button class="profile__action" type="button">
          <span>Cambiar Idioma</span>
          <span aria-hidden="true">&rsaquo;</span>
        </button>
        <button class="profile__action profile__action--warning" type="button">
          <span>Cerrar Sesion</span>
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.profile {
  height: calc(100vh - 80px);
  min-height: calc(100vh - 80px);
  background: #ffff;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.profile__layout {
  width: min(880px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.profile__header {
  width: 100%;
}

.profile__title {
  margin: 0;
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 700;
  color: #1f2e1f;
}

.profile__card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #f6f6f6;
  border-radius: 24px;
  padding: clamp(20px, 4vw, 32px);
  box-shadow: 0 10px 24px rgba(31, 78, 53, 0.1);
  width: 100%;
}

.profile__avatar {
  width: clamp(96px, 14vw, 140px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(85, 201, 109, 0.15), rgba(7, 120, 62, 0.1));
  display: grid;
  place-items: center;
  color: #3cb660;
  overflow: hidden;
}

.profile__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile__avatar-icon {
  width: clamp(60px, 10vw, 88px);
  height: clamp(60px, 10vw, 88px);
}

.profile__identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile__name {
  margin: 0;
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 600;
  color: #243624;
}

.profile__email {
  margin: 0;
  color: #5c6f5f;
  font-size: 15px;
}

.profile__actions {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(31, 78, 53, 0.08);
  padding: 8px;
  display: grid;
  gap: 6px;
  width: 100%;
}

.profile__action {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-radius: 14px;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: #2f3f30;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  border: none;
  text-decoration: none;
}

.profile__action:hover {
  background: rgba(92, 181, 115, 0.12);
  transform: translateX(3px);
}

.profile__action--warning {
  color: #c53030;
}

.profile__action--warning:hover {
  background: rgba(197, 48, 48, 0.1);
}

@media (max-width: 720px) {
  .profile {
    height: calc(100vh - 72px);
    min-height: calc(100vh - 72px);
    padding: 24px;
  }

  .profile__card {
    flex-direction: column;
    text-align: center;
  }

  .profile__identity {
    align-items: center;
  }
}
</style>
