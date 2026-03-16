from django.db.models import QuerySet
from django.contrib.auth.models import User
from .models import Todo

def todo_list(*, user: User, category_id: int = None) -> QuerySet[Todo]:
    """Return all todos belonging to the user, optionally filtered by category."""
    queryset = Todo.objects.filter(owner=user)
    if category_id:
        queryset = queryset.filter(category_id=category_id)
    return queryset

def todo_get(*, user: User, todo_id: int) -> Todo:
    """Return a single todo belonging to the user, or raise error."""
    return Todo.objects.get(id=todo_id, owner=user)

def category_list(*, user: User) -> QuerySet:
    """Return all categories belonging to the user."""
    from .models import Category
    return Category.objects.filter(owner=user)
