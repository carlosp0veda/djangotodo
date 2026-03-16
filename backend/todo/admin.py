from django.contrib import admin
from .models import Category, Todo

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'color', 'created_at')
    list_filter = ('owner', 'created_at')
    search_fields = ('name',)

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'category', 'completed', 'created_at')
    list_filter = ('completed', 'owner', 'category', 'created_at')
    search_fields = ('title', 'description')
