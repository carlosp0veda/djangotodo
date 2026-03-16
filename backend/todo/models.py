from django.db import models
from django.conf import settings
from core.models import TimeStampedModel

class Category(TimeStampedModel):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#3B82F6') # Default to a nice blue
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='categories', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('name', 'owner')

class Todo(TimeStampedModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='todos', on_delete=models.CASCADE)
    category = models.ForeignKey(Category, related_name='todos', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
