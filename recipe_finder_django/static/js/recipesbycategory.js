document.addEventListener("DOMContentLoaded", function() {
    const pathSegments = window.location.pathname.split('/');
    const selectedCategory = decodeURIComponent(pathSegments[pathSegments.length - 2] || '');

    if (!selectedCategory) {
        document.getElementById("recipeList").innerHTML = "<p class='no-recipes'>No category selected.</p>";
        return;
    }

    document.getElementById("categoryTitle").textContent = `Delicious ${selectedCategory} Recipes Just for You 🍽️`;
    document.getElementById("categoryName").textContent = selectedCategory.toLowerCase();

    fetch(`/api/categories/${encodeURIComponent(selectedCategory)}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch recipes.");
            }
            return response.json();
        })
        .then(data => {
            const recipes = data.recipes;
            renderRecipes(recipes, selectedCategory);
        })
        .catch(error => {
            document.getElementById("recipeList").innerHTML = `<p class='no-recipes'>Error loading recipes.</p>`;
            console.error(error);
        });
});


function renderRecipes(recipes, selectedCategory) {
    const recipeList = document.getElementById("recipeList");
    recipeList.innerHTML = "";

    if (!recipes || recipes.length === 0) {
        recipeList.innerHTML = '<p class="no-recipes">No recipes found. Add some recipes to see them here.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";
        recipeCard.style="background:#fceabb";
        recipeCard.dataset.id = recipe.id;
        recipeCard.dataset.name = recipe.name;

        let imageHtml = `<img src="${recipe.image || 'imgs/default-recipe.jpg'}" alt="${recipe.name}" onerror="this.src='imgs/default-recipe.jpg'">`;

        recipeCard.innerHTML = `
            ${imageHtml}
            <h3>${recipe.name || 'Unnamed Recipe'}</h3>
            <p>${recipe.description || 'A delicious dish'}</p>
            <div class="buttons-container">
                <button class="favorite-btn"><i class="fa fa-heart"></i></button>
                <button class="recipe-details" data-id="${recipe.id}">View details</button>
            </div>
        `;
        recipeList.appendChild(recipeCard);
    });

    FavandDetails(); 
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

        if (response.ok) 
        {
          const result = await response.json();

          if (result.status === "removed") {
            favoriteIds = favoriteIds.filter(id => id !== recipeId);
            console.log("Recipe removed from favorites");
          } 
          else if (result.status === "added") 
          {
            if (!favoriteIds.includes(recipeId)) 
            {
              favoriteIds.push(recipeId);
            }
            console.log("Recipe added to favorites");
          } 
          else {
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
    if (viewDetailsBtn) 
    {
      viewDetailsBtn.addEventListener("click", () => {
        window.location.href = `/api/recipe/${recipeId}/`;
      });
    }
  });
}
