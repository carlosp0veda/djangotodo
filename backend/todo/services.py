from typing import Dict, Any
from django.contrib.auth.models import User
from .models import Todo
from core.exceptions import ApplicationError

def todo_create(*, title: str, description: str = '', owner: User, category_id: int = None) -> Todo:
    if category_id:
        from .models import Category
        # Security: Validate that the category belongs to the user
        if not Category.objects.filter(id=category_id, owner=owner).exists():
            raise ApplicationError(message="Invalid category for this user.")

    todo = Todo.objects.create(
        title=title,
        description=description,
        owner=owner,
        category_id=category_id
    )
    return todo

def todo_update(*, todo: Todo, data: Dict[str, Any]) -> Todo:
    non_updatable_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    for field, value in data.items():
        if field in non_updatable_fields:
            continue
        if field == 'category_id' and value is not None:
             from .models import Category
             # Security: Validate that the category belongs to the user
             if not Category.objects.filter(id=value, owner=todo.owner).exists():
                 raise ApplicationError(message="Invalid category for this user.")
             setattr(todo, 'category_id', value)
             continue
        if hasattr(todo, field):
            setattr(todo, field, value)
            
    todo.save()
    return todo


def todo_delete(*, todo: Todo) -> None:
    todo.delete()
