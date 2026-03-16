from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated

from .selectors import todo_list, todo_get, category_list
from .services import todo_create, todo_update, todo_delete

class TodoApi(APIView):
    permission_classes = [IsAuthenticated]

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        title = serializers.CharField()
        description = serializers.CharField(allow_blank=True, allow_null=True)
        completed = serializers.BooleanField()
        owner = serializers.CharField(source='owner.email', read_only=True)
        category = serializers.SerializerMethodField()
        created_at = serializers.DateTimeField(read_only=True)
        updated_at = serializers.DateTimeField(read_only=True)

        def get_category(self, obj):
            if obj.category:
                return {
                    "id": obj.category.id,
                    "name": obj.category.name,
                    "color": obj.category.color
                }
            return None

    class InputSerializer(serializers.Serializer):
        title = serializers.CharField(max_length=200)
        description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        category_id = serializers.IntegerField(required=False, allow_null=True)

    def get(self, request):
        category_id = request.query_params.get('category_id')
        todos = todo_list(user=request.user, category_id=category_id)
        serializer = self.OutputSerializer(todos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        todo = todo_create(
            title=serializer.validated_data['title'],
            description=serializer.validated_data.get('description', ''),
            owner=request.user,
            category_id=serializer.validated_data.get('category_id')
        )
        
        output_serializer = self.OutputSerializer(todo)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class CategoryApi(APIView):
    permission_classes = [IsAuthenticated]

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        name = serializers.CharField()
        color = serializers.CharField()

    class InputSerializer(serializers.Serializer):
        name = serializers.CharField(max_length=100)
        color = serializers.CharField(max_length=7, required=False)

    def get(self, request):
        categories = category_list(user=request.user)
        serializer = self.OutputSerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        from .models import Category
        category = Category.objects.create(
            name=serializer.validated_data['name'],
            color=serializer.validated_data.get('color', '#3B82F6'),
            owner=request.user
        )
        
        output_serializer = self.OutputSerializer(category)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class TodoDetailApi(APIView):
    permission_classes = [IsAuthenticated]

    class OutputSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        title = serializers.CharField()
        description = serializers.CharField(allow_blank=True, allow_null=True)
        completed = serializers.BooleanField()
        owner = serializers.CharField(source='owner.email', read_only=True)
        category = serializers.SerializerMethodField()
        created_at = serializers.DateTimeField(read_only=True)
        updated_at = serializers.DateTimeField(read_only=True)

        def get_category(self, obj):
            if obj.category:
                return {
                    "id": obj.category.id,
                    "name": obj.category.name,
                    "color": obj.category.color
                }
            return None

    class InputSerializer(serializers.Serializer):
        title = serializers.CharField(max_length=200, required=False)
        description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        completed = serializers.BooleanField(required=False)
        category_id = serializers.IntegerField(required=False, allow_null=True)

    def get(self, request, todo_id):
        todo = todo_get(user=request.user, todo_id=todo_id)
        serializer = self.OutputSerializer(todo)
        return Response(serializer.data)

    def put(self, request, todo_id):
        todo = todo_get(user=request.user, todo_id=todo_id)
            
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        todo = todo_update(todo=todo, data=serializer.validated_data)
        
        output_serializer = self.OutputSerializer(todo)
        return Response(output_serializer.data)

    def delete(self, request, todo_id):
        todo = todo_get(user=request.user, todo_id=todo_id)
        todo_delete(todo=todo)
        return Response(status=status.HTTP_204_NO_CONTENT)
