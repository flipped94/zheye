import { defineStore } from 'pinia'
import axios from 'axios'
import { ImageProps, ResponseType } from './utils'

export interface UserDataProps {
  nickName?: string;
  _id?: string;
  column?: string;
  email?: string;
  avatar?: ImageProps;
  description?: string;
}

export interface UserProps {
  accessToken: string;
  refreshToken: string;
  isLogin: boolean;
  data: UserDataProps | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserProps => {
    return {
      accessToken: localStorage.getItem('accessToken') || '',
      refreshToken: localStorage.getItem('refreshToken') || '',
      isLogin: false,
      data: null
    }
  },
  actions: {
    async login(email: string, password: string) {
      const payload = {
        email,
        password
      }
      const { data } = await axios.post<ResponseType>('/passport/login', payload)
      this.accessToken = data.data.accessToken
      this.refreshToken = data.data.refreshToken
      localStorage.setItem('accessToken', this.accessToken)
      localStorage.setItem('refreshToken', this.refreshToken)
      // axios.defaults.headers.common.Authorization = `Bearer ${token}`
      axios.defaults.headers.accessToken = this.accessToken
      axios.defaults.headers.refreshToken = this.refreshToken
    },
    async updateAuthor(id: string, payload: UserDataProps) {
      const { data } = await axios.patch<ResponseType>('/author', payload)
      this.data = { ...data.data }
    },
    logout() {
      this.accessToken = ''
      this.refreshToken = ''
      this.isLogin = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // delete axios.defaults.headers.common.Authorization
      delete axios.defaults.headers.accessToken
      delete axios.defaults.headers.refreshToken
    },
    async fetchCurrentUser() {
      const { data } = await axios.get<ResponseType>('/author/current')
      this.isLogin = true
      this.data = { ...data.data }
    }
  },
  getters: {
    getCurrentAuthor: (state) => () => state.data
  }
})
