from django.urls import path
from . import views
from .views import (signup, login_view, create_recipe,
    get_all_recipes, get_recipe_details,)

urlpatterns = [
    path('signup/', signup),
    path('login/', login_view),
    path('recipes/add/', create_recipe),
    path('recipes/', get_all_recipes),
    path('recipes/<int:recipe_id>/', get_recipe_details),
]
