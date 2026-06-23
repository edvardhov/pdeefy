import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_API_URL = 'http://localhost:8000'

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
      apiUrl: DEFAULT_API_URL,
      setApiUrl: (url) => set({ apiUrl: url.replace(/\/$/, '') }),
      setBackendConnected: (connected) => set({ isBackendConnected: connected }),
    }),
    {
      name: 'pdeefy-settings',
      partialize: (state) => ({ apiUrl: state.apiUrl }),
    },
  ),
)

export { DEFAULT_API_URL }
