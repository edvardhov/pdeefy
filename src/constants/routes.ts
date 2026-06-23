export const ROUTES = {
  home: '/',
  tools: '/tools',
  tool: (id: string) => `/tool/${id}`,
  toolPattern: '/tool/:id',
} as const
