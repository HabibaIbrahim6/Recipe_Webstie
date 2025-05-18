async function loadRecipes() 
{
  const recipeList = document.getElementById("recipeList");
  recipeList.innerHTML = "";

  try 
  {
    const response = await fetch("/api/recipes/");
    const result = await response.json();
    const recipes = result.recipes;

    if (recipes.length === 0) 
    {
      recipeList.innerHTML = '<p class="no-recipes">No recipes found. Add some recipes to see them here.</p>';
      return;
    }

    recipes.forEach(recipe => {
      const recipeCard = document.createElement("div");
      recipeCard.className = "recipe-card";
      recipeCard.dataset.id = recipe.id;
      recipeCard.dataset.name = recipe.name;
      recipeCard.dataset.course = recipe.course_name;

      const imageHtml = `<img src="${recipe.image}" alt="${recipe.name}" onerror="this.src='imgs/default-recipe.jpg'">`;

      recipeCard.innerHTML = `
        ${imageHtml}
        <h3>${recipe.name}</h3>
        <p>${recipe.description}</p>
        <div class="buttons-container">
          
          <button class="favorite-btn"><i class="fa fa-heart"></i></button>
           <button class="recipe-details" data-target="Recipe_details_Page.html">View details</button>

        </div>
      `;

      recipeList.appendChild(recipeCard);
    });

    FavandDetails();

  } 
  catch (error) 
  {
    console.error("Failed to fetch recipes:", error);
    recipeList.innerHTML = `<p class="no-recipes">Error fetching recipes. Try again later.</p>`;
  }
}
async function FavandDetails() {
  const recipeCards = document.querySelectorAll(".recipe-card");

  const user = localStorage.getItem("user");
  if (!user) {
    console.warn("User not logged in.");
    return;
  }
  const userData = JSON.parse(user);
  const token = userData.token;

  let favoriteIds = [];
  try {
    const favoritesResponse = await fetch("/api/favorites/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (favoritesResponse.ok) {
      const favoritesData = await favoritesResponse.json();
      favoriteIds = favoritesData.favorites.map(fav => fav.id);
    } else {
      console.warn("Failed to fetch favorites list");
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }

  recipeCards.forEach(card => {
    const favoriteBtn = card.querySelector(".favorite-btn");
    const heartIcon = favoriteBtn.querySelector("i");
    const recipeId = parseInt(card.dataset.id);

    const updateHeartColor = () => {
      heartIcon.style.color = favoriteIds.includes(recipeId) ? "#D35400" : "gray";
    };
    updateHeartColor();

    favoriteBtn.addEventListener("click", async () => {
      const isFavorite = favoriteIds.includes(recipeId);
      if (!isFavorite) {
        favoriteIds.push(recipeId);
        heartIcon.style.color = "#D35400";
      }

      const url = isFavorite
        ? `/api/favorites/toggle/${recipeId}/`
        : `/api/favorites/add/${recipeId}/`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();

          if (result.status === "removed") {
            favoriteIds = favoriteIds.filter(id => id !== recipeId);
            console.log("Recipe removed from favorites");
          } else if (result.status === "added") {
            if (!favoriteIds.includes(recipeId)) {
              favoriteIds.push(recipeId);
            }
            console.log("Recipe added to favorites");
          } else {
            console.warn("Unexpected toggle response:", result);
          }

          updateHeartColor(); 
        } 
        else 
        {
          if (!isFavorite) 
          {
            favoriteIds = favoriteIds.filter(id => id !== recipeId);
            updateHeartColor();
          }
          const errorText = await response.text();
          try 
          {
            const error = JSON.parse(errorText);
            console.warn("Failed to toggle favorite:", error);
          } 
          catch 
          {
            console.warn("Non-JSON error:", errorText);
          }
        }
      } 
      catch (error) 
      {
        console.error("Favorite toggle error:", error);
        if (!isFavorite) {
          favoriteIds = favoriteIds.filter(id => id !== recipeId);
          updateHeartColor();
        }
      }
    });

    const viewDetailsBtn = card.querySelector(".recipe-details");
    if (viewDetailsBtn) {
      viewDetailsBtn.addEventListener("click", () => {
        window.location.href = `/api/recipe/${recipeId}/`;
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadRecipes();

  window.addEventListener('storage', function (event) {
    if (event.key === 'recipeUpdated') {
      console.log('Recipe update detected, reloading...');
      loadRecipes();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('updated')) {
    console.log(`Recipe ${urlParams.get('updated')} was recently updated`);
  }
});






