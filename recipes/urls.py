from django.urls import path
from . import views
from .views import (signup, login_view, create_recipe,
    get_all_recipes, get_recipe_details,list_favorites,add_to_favorites,toggle_favorite)

urlpatterns = [
    path('signup/', signup),
    path('login/', login_view),
    path('recipes/add/', create_recipe),
    path('recipes/', get_all_recipes),
    path('recipes/<int:recipe_id>/', get_recipe_details),
    path('favorites/add/<int:recipe_id>/',add_to_favorites),
    path('favorites/toggle/', toggle_favorite),
    path('favorites/', list_favorites),
]

