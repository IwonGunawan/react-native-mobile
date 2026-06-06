import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  id:     number,
  name:   string,
  email:  string,
  level:  '0' | '1', // 0;operator, 1:admin

}

interface AuthState {
  user:   User | null,
  token:  string | null,
  isAuth: boolean,
  setAuth: (user: User, token: string) => void,
  logout: () => void
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuth: false,
      setAuth: (user, token) => set({user, token, isAuth: true}),
      logout: () => set({user: null, token: null, isAuth: false})

    }),
    {
      name: 'auth-storage',
      /**
       * perbedaan dengan web
       * web:     used localStorage
       * mobile:  used asyncStorage
       */
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)