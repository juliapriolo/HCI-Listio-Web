import { reactive, readonly } from "vue";

const defaultProfile = {
  name: "Pedro",
  email: "pedro@gmail.com",
  avatar: null,
};

function loadStoredProfile() {
  if (typeof window === "undefined") {
    return { ...defaultProfile };
  }

  try {
    const stored = window.localStorage.getItem("listio-profile");
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : { ...defaultProfile };
  } catch (error) {
    console.warn("No se pudo leer el perfil almacenado:", error);
    return { ...defaultProfile };
  }
}

const state = reactive(loadStoredProfile());

function persistProfile() {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot = {
    name: state.name,
    email: state.email,
    avatar: state.avatar,
  };

  try {
    window.localStorage.setItem("listio-profile", JSON.stringify(snapshot));
  } catch (error) {
    console.warn("No se pudo guardar el perfil:", error);
  }
}

export function useProfileStore() {
  function updateProfile(payload = {}) {
    if (payload.name !== undefined) {
      state.name = payload.name;
    }
    if (payload.email !== undefined) {
      state.email = payload.email;
    }
    if (payload.avatar !== undefined) {
      state.avatar = payload.avatar;
    }
    persistProfile();
  }

  return {
    profile: readonly(state),
    updateProfile,
  };
}
