from django.urls import reverse
from rest_framework import status
from core.tests import BaseAPITestCase
from .models import Todo, Category
from django.contrib.auth import get_user_model

User = get_user_model()

class TodoAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.authenticate()
        self.todo_list_url = reverse('todo-list-create')
        
        self.other_user = self.create_user(email='other@example.com')
        self.other_todo = Todo.objects.create(title="Other Guy's Todo", owner=self.other_user)

    def test_create_todo(self):
        data = {'title': 'Buy groceries', 'description': 'Milk, Eggs'}
        response = self.client.post(self.todo_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # 1 from setUp (other_todo) + 1 new = 2
        self.assertEqual(Todo.objects.count(), 2)
        self.assertEqual(Todo.objects.get(title='Buy groceries').owner, self.user)

    def test_list_todos(self):
        Todo.objects.create(title='My Todo', owner=self.user)
        response = self.client.get(self.todo_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only get my own todo, not other_user's todo
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'My Todo')

    def test_update_todo(self):
        todo = Todo.objects.create(title='Initial', owner=self.user)
        url = reverse('todo-detail', args=[todo.id])
        data = {'title': 'Updated Title', 'completed': True}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        todo.refresh_from_db()
        self.assertEqual(todo.title, 'Updated Title')
        self.assertTrue(todo.completed)

    def test_delete_todo(self):
        todo = Todo.objects.create(title='To be deleted', owner=self.user)
        url = reverse('todo-detail', args=[todo.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Todo.objects.filter(owner=self.user).count(), 0)

    def test_get_other_user_todo_fails(self):
        url = reverse('todo-detail', args=[self.other_todo.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_todo_with_other_user_category_fails(self):
        other_category = Category.objects.create(name="Evil Category", owner=self.other_user)
        
        data = {
            'title': 'Hack Todo',
            'category_id': other_category.id
        }
        response = self.client.post(self.todo_list_url, data, format='json')
        
        # Should fail due to ApplicationError in service
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid category", response.data['detail'])

