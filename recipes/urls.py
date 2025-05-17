from django.urls import path
from . import views
from .views import (signup, login_view, create_recipe,
    get_all_recipes, get_recipe_details,list_favorites,add_to_favorites,toggle_favorite ,logout_view,protected_view,search_recipes,get_recipes_by_category,
login_page,signup_page,home_page,recipe_list_page,favorite_page,search_page,recipes_by_category
    ,admin_page,add_recipe_page,edit_recipe_page,categories_page,recipe_details_page)



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
    path('', login_page, name='login'),
    path('signUp/',signup_page, name='signup'),
    path('home/',home_page, name='home'),
    path('Recipes/',recipe_list_page, name='Recipes'),
    path('Favorites/',favorite_page, name='Favorites'),
    path('Search/',search_page, name='Search'),
    path('admin-page/',admin_page, name='admin_page'),
    path('add-recipe/',add_recipe_page, name='add_recipe'),
    path('edit-recipe/<int:recipe_id>/',edit_recipe_page, name='edit_recipe'),
    path('categories/',categories_page, name='categories'),
    path('recipesbycategory/',recipes_by_category, name='recipes_by_category'),
    path('recipe/<int:recipe_id>/',recipe_details_page, name='recipe_details'),
]
