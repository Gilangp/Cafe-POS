export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
