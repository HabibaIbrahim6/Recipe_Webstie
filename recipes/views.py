from django.shortcuts import render,HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Recipe, Ingredient, Instruction,Favorite
from django.shortcuts import get_object_or_404


import json
@csrf_exempt
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        is_admin_str = data.get('is_admin', "false")  

    
        if is_admin_str not in ["true", "false"]:
            return JsonResponse({'error': 'Invalid value for is_admin'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        user.profile.is_admin = is_admin_str  
        user.profile.save()

        return JsonResponse({'message': 'User created successfully'}, status=201)


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'is_admin': user.profile.is_admin
            })
        return JsonResponse({'error': 'Invalid credentials'}, status=401)


@csrf_exempt
def create_recipe(request):
    if request.method == 'POST':
        data = request.POST
        image = request.FILES.get('image')
        
        recipe = Recipe.objects.create(
            name=data.get('name'),
            description=data.get('description'),
            course_name=data.get('course_name'),
            time=data.get('time', '00:00'),  
            image=image
        )

        ingredients = json.loads(data.get('ingredients', '[]'))
        for ing in ingredients:
            Ingredient.objects.create(recipe=recipe, name=ing['name'], quantity=ing['quantity'])

        recipe.noingredients = recipe.ingredients.count()
        recipe.save()

        instructions = json.loads(data.get('instructions', '[]'))
        for step in instructions:
            Instruction.objects.create(recipe=recipe, step=step)

        return JsonResponse({'message': 'Recipe created successfully'})
def get_all_recipes(request):
    recipes = Recipe.objects.all()
    data = []

    for recipe in recipes:
        data.append({
            'id': recipe.id,
            'name': recipe.name,
            'description': recipe.description,
            'course_name': recipe.course_name,
            'time': recipe.time,
            'noingredients': recipe.ingredients.count(),
            'image': request.build_absolute_uri(recipe.image.url)
        })

    return JsonResponse({'recipes': data})
def get_recipe_details(request, recipe_id):
    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return JsonResponse({'error': 'Recipe not found'}, status=404)

    ingredients = recipe.ingredients.all()
    instructions = recipe.instructions.all()

    return JsonResponse({
        'id': recipe.id,
        'name': recipe.name,
        'description': recipe.description,
        'course_name': recipe.course_name,
        'time': recipe.time,
        'noingredients':recipe.ingredients.count() ,
        'image': request.build_absolute_uri(recipe.image.url),
        'ingredients': [{'name': i.name, 'quantity': i.quantity} for i in ingredients],
        'instructions': [i.step for i in instructions],
    })

def add_to_favorites(request, recipe_id):
    if request.method != "POST":
        return HttpResponse("Only POST allowed.")

    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return JsonResponse({'error': 'Recipe not found'}, status=404)

    favorite, created = Favorite.objects.get_or_create(user=request.user, recipe=recipe)

    if not created:
        return JsonResponse({'message': 'Recipe already in favorites'}, status=400)

    return JsonResponse({'message': 'Recipe added to favorites'}, status=201)


def toggle_favorite(request):
    if request.method != 'POST':
        return HttpResponse("Only POST allowed.")

    try:
        data = json.loads(request.body)
        recipe_id = data.get('recipe_id')
    except (json.JSONDecodeError, KeyError, TypeError):
        return JsonResponse({'error': 'Invalid input'}, status=400)

    if not recipe_id:
        return JsonResponse({'error': 'recipe_id is required'}, status=400)

    recipe = get_object_or_404(Recipe, id=recipe_id)

    favorite, created = Favorite.objects.get_or_create(user=request.user, recipe=recipe)

    if not created:
        favorite.delete()
        return JsonResponse({'status': 'removed'})

    return JsonResponse({'status': 'added'})

def list_favorites(request):
    if request.method != "GET":
        return HttpResponse("Only GET allowed.")

    favorites = Favorite.objects.filter(user=request.user).select_related('recipe')
    
    recipes_data = []
    for favorite in favorites:
        recipe = favorite.recipe
        recipes_data.append({
            'id': recipe.id,
            'name': recipe.name,
            'description': recipe.description,
            'course_name': recipe.course_name,
            'time': recipe.time,
            'image': recipe.image.url if recipe.image else None,
        })

    return JsonResponse({'favorites': recipes_data})
# Create your views here.
