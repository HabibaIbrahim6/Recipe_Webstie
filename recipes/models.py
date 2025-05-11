from django.db import models
from django.contrib.auth.models import User


    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_admin = models.CharField(max_length=5, choices=[("true", "True"), ("false", "False")], default="false")

    def __str__(self):
        return self.user.username
    
class Recipe(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    course_name = models.CharField(max_length=100)  
    time = models.CharField(max_length=50)  
    image = models.ImageField(upload_to='recipes/')  
    # media/recipes

    def __str__(self):
        return self.name
    

class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} ({self.quantity})"


class Instruction(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='instructions')
    step = models.TextField()
    order = models.PositiveIntegerField()  

    def __str__(self):
        return f"Step {self.order} for {self.recipe.name}"
    

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='favorited_by')

    class Meta:
        unique_together = ('user', 'recipe')

# Create your models here.
