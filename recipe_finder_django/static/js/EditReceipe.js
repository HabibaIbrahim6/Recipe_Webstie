document.addEventListener("DOMContentLoaded", function () {
  const recipePhotoInput = document.getElementById("recipe-photo");
  const imagePreview = document.getElementById("image-preview");
  const ingredientsList = document.getElementById("ingredients-list");
  const directionsList = document.getElementById("directions-list");
  const recipeForm = document.getElementById("recipe-form");

  let storedRecipe = null;
  const recipeId = new URLSearchParams(window.location.search).get("id");
  let caloriesPerIngredient = JSON.parse(localStorage.getItem("calories")) || {};

  // ✅ Fetch recipe data from API
  fetch(`https://api.example.com/recipes/${recipeId}/`)
    .then(res => res.json())
    .then(data => {
      storedRecipe = data;
      populateFormWithRecipe(storedRecipe);
    })
    .catch(error => console.error("Error fetching recipe:", error));

  function populateFormWithRecipe(recipe) {
    document.getElementById("recipe-name").value = recipe.name;
    document.getElementById("duration").value = parseInt(recipe.time) || 30;
    document.getElementById("description").value = recipe.description;
    document.getElementById("course").value = recipe.courseName;

    ingredientsList.innerHTML = "";
    recipe.ingredients.forEach(ingredient => {
      const [quantity, unit] = parseQuantity(ingredient.quantity);
      const cal = ingredient.calories || caloriesPerIngredient[ingredient.name] || 0;

      const ingredientDiv = document.createElement("div");
      ingredientDiv.classList.add("ingredient");
      ingredientDiv.innerHTML = `
        <input type="text" placeholder="Quantity" value="${quantity}" required>
        <select>
          <option ${unit === 'gram' ? 'selected' : ''}>gram</option>
          <option ${unit === 'oz' ? 'selected' : ''}>oz</option>
          <option ${unit === 'cup' ? 'selected' : ''}>cup</option>
        </select>
        <input type="text" placeholder="Ingredient Name" value="${ingredient.name}" required>
        <input type="number" placeholder="Calories per ingredient" value="${cal}" required>
        <button type="button" class="remove-btn"><i class="fas fa-times"></i></button>
      `;
      ingredientsList.appendChild(ingredientDiv);

      ingredientDiv.querySelector(".remove-btn").addEventListener("click", () => {
        ingredientsList.removeChild(ingredientDiv);
      });
    });

    directionsList.innerHTML = "";
    recipe.instructions.forEach(step => {
      const directionDiv = document.createElement("div");
      directionDiv.classList.add("direction");
      directionDiv.innerHTML = `
        <textarea required>${step}</textarea>
        <button type="button" class="remove-btn"><i class="fas fa-times"></i></button>
      `;
      directionsList.appendChild(directionDiv);

      directionDiv.querySelector(".remove-btn").addEventListener("click", () => {
        directionsList.removeChild(directionDiv);
      });
    });

    if (recipe.image) {
      imagePreview.src = recipe.image;
      imagePreview.style.display = 'block';
    }
  }

  function parseQuantity(quantity) {
    const match = quantity.match(/(\d+)(\D*)/);
    return match ? [match[1], match[2].trim()] : [quantity, ''];
  }

  document.querySelector(".add-btn").addEventListener("click", function () {
    const ingredientDiv = document.createElement("div");
    ingredientDiv.classList.add("ingredient");
    ingredientDiv.innerHTML = `
      <input type="text" placeholder="Quantity" required>
      <select>
        <option>gram</option>
        <option>oz</option>
        <option>cup</option>
      </select>
      <input type="text" placeholder="Ingredient Name" required>
      <input type="number" placeholder="Calories per ingredient" required>
      <button type="button" class="remove-btn"><i class="fas fa-times"></i></button>
    `;
    ingredientsList.appendChild(ingredientDiv);

    ingredientDiv.querySelector(".remove-btn").addEventListener("click", () => {
      ingredientsList.removeChild(ingredientDiv);
    });
  });

  document.getElementById("add-direction-btn").addEventListener("click", function () {
    const directionDiv = document.createElement("div");
    directionDiv.classList.add("direction");
    directionDiv.innerHTML = `
      <textarea placeholder="Write cooking instructions..." required></textarea>
      <button type="button" class="remove-btn"><i class="fas fa-times"></i></button>
    `;
    directionsList.appendChild(directionDiv);

    directionDiv.querySelector(".remove-btn").addEventListener("click", () => {
      directionsList.removeChild(directionDiv);
    });
  });

  recipePhotoInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  recipeForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedRecipe = {
      ...storedRecipe,
      name: document.getElementById("recipe-name").value,
      time: document.getElementById("duration").value + " min",
      description: document.getElementById("description").value,
      courseName: document.getElementById("course").value,
      image: imagePreview.src || storedRecipe.image || '',
      ingredients: Array.from(document.querySelectorAll("#ingredients-list .ingredient")).map(div => {
        const quantity = div.children[0].value;
        const unit = div.children[1].value;
        const name = div.children[2].value;
        const calories = parseInt(div.children[3].value) || 0;

        caloriesPerIngredient[name] = calories;

        return {
          id: Math.random(),
          name,
          quantity: quantity + " " + unit,
          calories
        };
      }),
      instructions: Array.from(document.querySelectorAll("#directions-list textarea")).map(textarea => textarea.value)
    };

    localStorage.setItem("calories", JSON.stringify(caloriesPerIngredient));

    // ✅ Send updated recipe to API (PUT)
    fetch(`https://api.example.com/recipes/${storedRecipe.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedRecipe)
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update recipe.");
      return res.json();
    })
    .then(data => {
      alert("Recipe updated successfully!");
      window.location.href = "Recipe_List_Page.html";
    })
    .catch(error => {
      console.error("Error updating recipe:", error);
      alert("There was a problem updating the recipe.");
    });
  });
});
