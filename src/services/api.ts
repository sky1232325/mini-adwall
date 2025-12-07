import type { Ad, FormFieldConfig } from '../types';

// 生产环境使用相对路径，开发环境使用绝对路径
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : '/api';

export const fetchFormConfig = async (): Promise<FormFieldConfig[]> => {
  const response = await fetch(`${API_BASE_URL}/form-config`);
  return response.json();
};

export const fetchAds = async (): Promise<Ad[]> => {
  const response = await fetch(`${API_BASE_URL}/ads`);
  return response.json();
};

export const createAd = async (formData: FormData): Promise<Ad> => {
  const response = await fetch(`${API_BASE_URL}/ads`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const updateAd = async (id: string, formData: FormData): Promise<Ad> => {
  const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
    method: 'PUT',
    body: formData,
  });
  return response.json();
};

export const deleteAd = async (id: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/ads/${id}`, {
    method: 'DELETE',
  });
};

export const clickAd = async (id: string): Promise<{ clicks: number }> => {
  const response = await fetch(`${API_BASE_URL}/ads/${id}/click`, {
    method: 'POST',
  });
  return response.json();
};