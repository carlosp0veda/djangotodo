from django.urls import path
from .views import TodoApi, TodoDetailApi, CategoryApi

urlpatterns = [
    path('todos', TodoApi.as_view(), name='todo-list-create'),
    path('todos/<int:todo_id>', TodoDetailApi.as_view(), name='todo-detail'),
    path('categories', CategoryApi.as_view(), name='category-list-create'),
]
