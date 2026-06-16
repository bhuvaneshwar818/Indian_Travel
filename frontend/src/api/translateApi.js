import { apiClient } from '../store/authStore'

export const translateApi = {
  translate: (text, targetLang) => apiClient.post('/translate', { text, targetLang })
};
