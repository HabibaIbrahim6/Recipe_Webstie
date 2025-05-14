from django.urls import path
from . import views
from .views import (signup, login_view, create_recipe,
    get_all_recipes, get_recipe_details,list_favorites,add_to_favorites,toggle_favorite ,logout_view,protected_view,search_recipes,get_recipes_by_category)



urlpatterns = [
    path('signup/', signup),
    path('login/', login_view),  
    path('protected/', protected_view, name='protected'),
    path('logout/', logout_view, name='logout'),
    path('search/', search_recipes),
    path('recipes/add/', create_recipe),
    path('recipes/', get_all_recipes),
    path('recipes/<int:recipe_id>/', get_recipe_details),
    path('favorites/add/<int:recipe_id>/',add_to_favorites),
    path('favorites/toggle/<int:recipe_id>/',toggle_favorite),
    path('favorites/', list_favorites),
    path('categories/<str:course_name>/', get_recipes_by_category),
    path('delete_recipe/<int:recipe_id>/', views.delete_recipe, name='delete_recipe'),
     path('update_recipe/<int:recipe_id>/', views.update_recipe, name='update_recipe'),
]
