document.addEventListener("DOMContentLoaded", async function () { 
  const recipeId = window.recipeId;

  try {
    const response = await fetch(`/api/recipes/${recipeId}/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const recipe = await response.json();

    document.querySelector(".title").textContent = recipe.name;
    document.querySelector(".recipe-img").src = recipe.image;
    document.querySelector(".time").textContent = `${recipe.time}`;
    document.querySelector(".noingredients").textContent = `${recipe.noingredients} ingredients`;

    const ingredientList = document.querySelector(".ingredients ul");
    ingredientList.innerHTML = "";
    recipe.ingredients.forEach(ingredient => {
      const li = document.createElement("li");
      li.textContent = `${ingredient.name} - ${ingredient.quantity}`;
      ingredientList.appendChild(li);
    });

    const instructionList = document.querySelector(".instructions ul");
    instructionList.innerHTML = "";
    recipe.instructions.forEach(instruction => {
      const li = document.createElement("li");
      li.textContent = instruction;
      instructionList.appendChild(li);
    });

  } catch (error) {
    console.error("Error loading recipe details:", error);
  }
});

  
