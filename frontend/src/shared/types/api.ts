export type ApiMeta = {
  request_id?: string;
  timestamp?: string;
  version?: string;
};

export type ApiResponse<T> = {
  data: T;
  meta?: ApiMeta;
};

export type PaginatedResponse<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
  };
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    status_code: number;
    details?: Record<string, unknown>;
  };
};

export type Branch = {
  id: number;
  name: string;
  code: string;
  address: string;
};

export type MenuItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  is_featured: boolean;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  total: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  branch_id?: number | null;
  branch?: Branch | null;
  permissions?: string[];
  scoped_branch_ids?: number[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token?: string;
  token?: string;
  user: User;
};