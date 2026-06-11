import api from "./api"

export const villageService = {
  getAll: () => {
    return api.get('/villages').then(r => r.data);
  }
}