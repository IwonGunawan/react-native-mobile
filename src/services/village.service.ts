import { Village } from "../types";
import api from "./api"

export const villageService = {
  getAll: () => {
    return api.get<Village[]>('/villages').then(r => r.data);
  }
}