import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API } from '@/constants/api'
import { STORAGE_KEYS } from '@/constants/storage'

interface AppState {
  isBackendConnected: boolean
  apiUrl: string
  setApiUrl: (url: string) => void
  setBackendConnected: (connected: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isBackendConnected: false,
      apiUrl: API.DEFAULT_URL,
      setApiUrl: (url) => set({ apiUrl: url.replace(/\/$/, '') }),
      setBackendConnected: (connected) => set({ isBackendConnected: connected }),
    }),
    {
      name: STORAGE_KEYS.settings,
      partialize: (state) => ({ apiUrl: state.apiUrl }),
    },
  ),
)

export { API }
