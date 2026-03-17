import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

export const handlers = [
  http.post(`${BASE_URL}/api/token`, () => {
    return HttpResponse.json({
      access: 'mocked-access-token',
      refresh: 'mocked-refresh-token',
    });
  }),

  http.get(`${BASE_URL}/api/todos`, () => {
    return HttpResponse.json([
      { id: 1, title: 'Sample Todo', completed: false },
    ]);
  }),

  http.get(`${BASE_URL}/api/categories`, () => {
    return HttpResponse.json([
      { id: 1, name: 'random thoughts', color: '#EF9C66' },
      { id: 2, name: 'personal', color: '#78ABA8' },
      { id: 3, name: 'school', color: '#FCDC94' },
      { id: 4, name: 'drama', color: '#C8CFA0' },
    ]);
  }),

  http.post(`${BASE_URL}/api/categories`, async ({ request }) => {
    const newCategory = await request.json() as { name: string, color: string };

    return HttpResponse.json({
      id: Math.floor(Math.random() * 1000), // Mocked ID
      name: newCategory.name,
      color: newCategory.color,
    }, { status: 201 });
  }),

  http.post(`${BASE_URL}/api/token/refresh`, () => {
    return HttpResponse.json({
      access: 'new-mocked-access-token',
    });
  }),
];
