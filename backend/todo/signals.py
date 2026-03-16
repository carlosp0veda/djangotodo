from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import Category

User = get_user_model()

DEFAULT_CATEGORIES = [
    {"name": "random thoughts", "color": "#EF9C66"},
    {"name": "personal", "color": "#78ABA8"},
    {"name": "school", "color": "#FCDC94"},
    {"name": "drama", "color": "#C8CFA0"},
]

@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        for cat_data in DEFAULT_CATEGORIES:
            Category.objects.get_or_create(
                owner=instance,
                name=cat_data["name"],
                defaults={"color": cat_data["color"]}
            )
