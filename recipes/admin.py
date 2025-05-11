
from django.contrib import admin
from .models import Recipe, Ingredient, Instruction, Profile


class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1


class InstructionInline(admin.TabularInline):
    model = Instruction
    extra = 1

class RecipeAdmin(admin.ModelAdmin):
    inlines = [IngredientInline, InstructionInline]
    list_display = ['name', 'course_name', 'time','id']
    search_fields = ['name']


class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_admin']
    search_fields = ['user__username']


admin.site.register(Recipe, RecipeAdmin)
admin.site.register(Ingredient)
admin.site.register(Instruction)
admin.site.register(Profile, ProfileAdmin)

# Register your models here.
