from rest_framework import serializers
from .models import Recipe  # عدلي الاسم لو مختلف

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'
