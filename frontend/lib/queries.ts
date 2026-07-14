import { apiClient } from '@/lib/api-client';
import type { ApiResponse, Branch, MenuItem, Order, PaginatedResponse } from '@/types/api';

export async function getHealth() {
  const response = await apiClient.get<ApiResponse<{ status: string }>>('/health');
  return response.data;
}

export async function getBranches() {
  const response = await apiClient.get<PaginatedResponse<Branch>>('/branches');
  return response.data;
}

export async function getMenuItems() {
  const response = await apiClient.get<PaginatedResponse<MenuItem>>('/products');
  return response.data;
}

export async function getOrders() {
  const response = await apiClient.get<PaginatedResponse<Order>>('/orders');
  return response.data;
}