import { apiClient } from '../store/authStore'

export const weatherApi = {
  getWeather: (city) => apiClient.get(`/weather?city=${city}`)
};
