from django.shortcuts import render, HttpResponse,get_object_or_404  
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Recipe, Ingredient, Instruction, Favorite, AuthToken
import json
from django.utils import timezone
from django.db.models import Q
import uuid
from django.contrib.auth.decorators import login_required, user_passes_test

def is_admin(user):
    return hasattr(user, 'profile') and user.profile.is_admin

def login_page(request):
    return render(request, 'recipes/Login.html')

def signup_page(request):
    return render(request, 'recipes/SignUp.html')

@login_required
def home_page(request):
    return render(request, 'recipes/Home.html')

@login_required
def recipe_list_page(request):
    return render(request, 'recipes/Recipe_List_Page.html')

@login_required
def search_page(request):
    return render(request, 'recipes/SearchPage.html')

@login_required
def recipe_details_page(request, recipe_id):
    return render(request, 'recipes/Recipe_details_page.html', {'recipe_id': recipe_id})

@user_passes_test(is_admin)
def admin_page(request):
    return render(request, 'recipes/Admin.html')

@user_passes_test(is_admin)
def add_recipe_page(request):
    return render(request, 'recipes/Add Reciepe.html')

@user_passes_test(is_admin)
def edit_recipe_page(request):
    return render(request, 'recipes/EditRecipe.html')

@login_required
def favorite_page(request):
    return render(request, 'recipes/Favourite Page.html')

@login_required
def categories_page(request):
    return render(request, 'recipes/categories.html')

@login_required
def recipes_by_category(request):
    category = request.GET.get('category')  
    return render(request, 'recipes/recipesbycategory.html',{'category': category})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            user = User.objects.filter(email=email).first()

            if user:
                user = authenticate(username=user.username, password=password)
                if not user:
                    return JsonResponse({'error': 'The password is incorrect'}, status=401)
            else:
                return JsonResponse({'error': 'The email is incorrect'}, status=401)

            token_obj, created = AuthToken.objects.get_or_create(user=user)
            if not created:
                token_obj.key = str(uuid.uuid4())
                token_obj.save()

            return JsonResponse({
                'id': user.id,
                'email': user.email,
                'is_admin': getattr(user.profile, 'is_admin', False),
                'token': token_obj.key
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid method'}, status=405)
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import re

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            is_admin_str = data.get('is_admin', "false")
            phone = data.get('phone', "")
            email = data.get('email')

            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)
            try:
                validate_email(email)  
            except ValidationError:
                return JsonResponse({'error': 'Invalid email format'}, status=400)

           
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already exists'}, status=400)

       
            if len(password) < 6:
                return JsonResponse({'error': 'Password must be at least 6 characters'}, status=400)

           
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)

          
            if is_admin_str not in ["true", "false"]:
                return JsonResponse({'error': 'Invalid value for is_admin'}, status=400)

          
            if phone and not re.match(r'^\+?1?\d{9,15}$', phone):  # تحقق من الرقم بأحرف أو مع رمز الدولة
                return JsonResponse({'error': 'Invalid phone number format'}, status=400)

           
            user = User.objects.create_user(username=username, password=password, email=email)

           
            user.profile.is_admin = (is_admin_str == "true")
            user.profile.phone = phone
            user.profile.save()

           
            token_obj, created = AuthToken.objects.get_or_create(user=user)
            if not created:
                token_obj.key = str(uuid.uuid4())
                token_obj.save()

            return JsonResponse({
                'message': 'User created successfully',
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_admin': user.profile.is_admin,
                'phone': user.profile.phone,
                'token': token_obj.key
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)

    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def logout_view(request):
    token = request.headers.get('Authorization')
    
    if not token:
        return JsonResponse({'error': 'Token required'}, status=400)
    
  
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        token_obj = AuthToken.objects.get(key=token)
        token_obj.delete()
        return JsonResponse({'message': 'Logged out successfully'})
    except AuthToken.DoesNotExist:
        return JsonResponse({'error': 'Invalid token'}, status=401)

def protected_view(request):
    token = request.headers.get('Authorization')
    if not token:
        return JsonResponse({'error': 'Token required'}, status=400)

    try:
        token_obj = AuthToken.objects.get(key=token)
        user = token_obj.user
    except AuthToken.DoesNotExist:
        return JsonResponse({'error': 'Invalid token'}, status=401)

    return JsonResponse({'message': 'This is a protected view!'})

@csrf_exempt
def create_recipe(request):
    if request.method == 'POST':
        try:
            data = request.POST
            image = request.FILES.get('image')

            
            recipe = Recipe.objects.create(
                name=data.get('name'),
                description=data.get('description'),
                course_name=data.get('course_name'),
                time=data.get('time', '00:00'),
                image=image
            )

            ingredients_json = data.get('ingredients', '[]')
            ingredients = json.loads(ingredients_json)
            for ing in ingredients:
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ing['name'],
                    quantity=ing['quantity']
                )

          
            instructions_json = data.get('instructions', '[]')
            instructions = json.loads(instructions_json)
            for instruction in instructions:
                Instruction.objects.create(
                    recipe=recipe,
                    step=instruction.get('step'),
                    order=instruction.get('order')
                )

            recipe.noingredients = recipe.ingredients.count()
            recipe.save()

            return JsonResponse({'message': 'Recipe created successfully'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


    
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

@csrf_exempt
def add_to_favorites(request, recipe_id):
    if request.method != "POST":
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    token = request.headers.get('Authorization')
    if not token:
        return JsonResponse({'error': 'Token required'}, status=400)
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        token_obj = AuthToken.objects.get(key=token)
        user = token_obj.user
    except AuthToken.DoesNotExist:
        return JsonResponse({'error': 'Invalid token'}, status=401)

    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return JsonResponse({'error': 'Recipe not found'}, status=404)

    favorite, created = Favorite.objects.get_or_create(user=user, recipe=recipe)

    if not created:
        return JsonResponse({'message': 'Recipe already in favorites'}, status=400)

    return JsonResponse({'message': 'Recipe added to favorites'}, status=201)


@csrf_exempt
def toggle_favorite(request, recipe_id):
    if request.method != 'POST':
        return HttpResponse("Only POST allowed.")

    token = request.headers.get('Authorization')
    if not token:
        return JsonResponse({'error': 'Token required'}, status=400)
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        token_obj = AuthToken.objects.get(key=token)
        user = token_obj.user
    except AuthToken.DoesNotExist:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return JsonResponse({'error': f'Recipe with ID {recipe_id} not found'}, status=404)

    favorite, created = Favorite.objects.get_or_create(user=user, recipe=recipe)

    if not created:
        favorite.delete()
        return JsonResponse({'status': 'removed'})

    return JsonResponse({'status': 'added'})

def list_favorites(request):
    if request.method != "GET":
        return HttpResponse("Only GET allowed.")

    token = request.headers.get('Authorization')
    if not token:
        return JsonResponse({'error': 'Token required'}, status=400)
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        token_obj = AuthToken.objects.get(key=token)
        user = token_obj.user
    except AuthToken.DoesNotExist:
        return JsonResponse({'error': 'Invalid token'}, status=401)

    favorites = Favorite.objects.filter(user=user).select_related('recipe')

    recipes_data = []
    for favorite in favorites:
        recipe = favorite.recipe
        ingredients = recipe.ingredients.all()
        instructions = recipe.instructions.all()

        recipes_data.append({
            'id': recipe.id,
            'name': recipe.name,
            'description': recipe.description,
            'course_name': recipe.course_name,
            'time': recipe.time,
            'image': recipe.image.url if recipe.image else None,
            'ingredients': [{'name': i.name, 'quantity': i.quantity} for i in ingredients],
            'instructions': [i.step for i in instructions],
        })

    return JsonResponse({'favorites': recipes_data})

def search_recipes(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    query = request.GET.get('q', '').strip()

    if not query:
        return JsonResponse({'error': 'No search query provided'}, status=400)

    recipes = Recipe.objects.filter(
        Q(name__icontains=query) |
        Q(course_name__icontains=query) |
        Q(ingredients__name__icontains=query)
    ).distinct()

    data = []
    for recipe in recipes:
        data.append({
            'id': recipe.id,
            'name': recipe.name,
            'description': recipe.description,
            'course_name': recipe.course_name,
            'time': recipe.time,
            'noingredients': recipe.ingredients.count(),
            'image': request.build_absolute_uri(recipe.image.url) if recipe.image else None
        })

    return JsonResponse({'results': data})

@csrf_exempt
def get_recipes_by_category(request, course_name):
    if request.method != "GET":
        return JsonResponse({"error": "only GET method allowed"}, status=405)

    recipes = Recipe.objects.filter(course_name__iexact=course_name).prefetch_related('ingredients', 'instructions')

    data = []
    for recipe in recipes:
        ingredients_data = [
            {'name': ing.name, 'quantity': ing.quantity}
            for ing in recipe.ingredients.all()
        ]
        instructions_data = [
            {'order': inst.order, 'step': inst.step}
            for inst in recipe.instructions.all().order_by('order')
        ]
        data.append({
            'id': recipe.id,
            'name': recipe.name,
            'description': recipe.description,
            'course_name': recipe.course_name,
            'time': recipe.time,
            'image': request.build_absolute_uri(recipe.image.url) if recipe.image else None,
            'ingredients': ingredients_data,
            'instructions': instructions_data,
        })

    return JsonResponse({'recipes': data}, status=200)

@csrf_exempt
def delete_recipe(request, recipe_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method allowed'}, status=405)

    try:
        recipe = Recipe.objects.get(id=recipe_id)
        recipe.delete()
        return JsonResponse({'message': 'Recipe deleted successfully'})
    except Recipe.DoesNotExist:
        return JsonResponse({'error': 'Recipe not found'}, status=404)
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Recipe, Ingredient, Instruction
from django.utils.datastructures import MultiValueDictKeyError
@csrf_exempt
def update_recipe(request, recipe_id):
    if request.method == "POST":
        try:
            recipe = get_object_or_404(Recipe, id=recipe_id)

            data = request.POST
            image = request.FILES.get('image')


            recipe.name = data.get('name', recipe.name)
            recipe.description = data.get('description', recipe.description)
            recipe.course_name = data.get('course_name', recipe.course_name)
            recipe.time = data.get('time', recipe.time)

            if image:
                recipe.image = image

            recipe.save()

            
            ingredients_json = data.get('ingredients', '[]')
            ingredients = json.loads(ingredients_json)

            
            recipe.ingredients.all().delete()
            for ing in ingredients:
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ing['name'],
                    quantity=ing['quantity']
                )

           
            instructions_json = data.get('instructions', '[]')
            instructions = json.loads(instructions_json)

           
            recipe.instructions.all().delete()
            for instruction in instructions:
                Instruction.objects.create(
                    recipe=recipe,
                    step=instruction.get('step'),
                    order=instruction.get('order')
                )

            
            recipe.noingredients = recipe.ingredients.count()
            recipe.save()

            return JsonResponse({"message": "Recipe updated successfully!"}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)
# Create your views here.

