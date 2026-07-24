export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'Velvra',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
};