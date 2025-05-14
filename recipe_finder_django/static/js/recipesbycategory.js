recipes=JSON.parse(localStorage.getItem("allRecipes"));
let selectedcategory=(localStorage.getItem("selectedcategory"));
document.getElementById("categoryTitle").textContent = `Delicious ${selectedcategory} Recipes Just for You 🍽️`;
document.getElementById("categoryName").textContent = selectedcategory.toLowerCase();
function loadRecipes() {
    const recipeList = document.getElementById("recipeList");
    
    recipeList.innerHTML = "";
  
    if (recipes.length === 0) {
        recipeList.innerHTML = '<p class="no-recipes">No recipes found. Add some recipes to see them here.</p>';
        return;
    }
  
    recipes.forEach(recipe => {
        if(recipe.courseName==selectedcategory.toLowerCase())
        {
            const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";
        recipeCard.style="background:#fceabb";
        recipeCard.dataset.id = recipe.id;
        recipeCard.dataset.name = recipe.name;
        recipeCard.dataset.course = recipe.courseName;
  
        let imageHtml = '';
        try {
            imageHtml = `<img src="${recipe.image || 'imgs/default-recipe.jpg'}" alt="${recipe.name}" 
                       onerror="this.src='imgs/default-recipe.jpg'">`;
        } catch (e) {
            imageHtml = `<div class="image-placeholder">No Image</div>`;
        }
  
        recipeCard.innerHTML = `
            ${imageHtml}
            <h3>${recipe.name || 'Unnamed Recipe'}</h3>
            <p>${recipe.description || 'A delicious dish'}</p>
            <div class="buttons-container">
                <button class="favorite-btn"><i class="fa fa-heart"></i></button>
                <button class="recipe-details" data-target="Recipe_details_Page.html">View details</button>
            </div>
        `;
        recipeList.appendChild(recipeCard);
        FavandDetails(); 
        }
        
    });
}
  
  document.addEventListener("DOMContentLoaded", function() {
    loadRecipes();
    // localStorage.removeItem("selectedcategory");
    
    window.addEventListener('storage', function(event) {
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
  
  
  //
  function FavandDetails() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const cards = document.querySelectorAll(".recipe-card");
    for (let i = 0; i < cards.length; i++) {
      
      const card = cards[i];
      const favbtn = card.querySelector(".favorite-btn");
      const detailsbtn = card.querySelector(".recipe-details");
      const recipename = card.dataset.name;
      if (favorites.some(r => r.name === recipename)) {
        favbtn.style.color = '#D35400';  
        favbtn.classList.add("favorited");
      }
      favbtn.onclick = function () {
        const recipe = {
          name: recipename,
          image: card.querySelector("img").src,
          title: recipename,
          description: card.querySelector("p").textContent
        };
    
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
        if (favbtn.classList.contains("favorited")) {
          favbtn.classList.remove("favorited");
          favorites = favorites.filter(r => r.name !== recipe.name);
        } 
        else {
          favbtn.classList.add("favorited");
          if (!favorites.some(r => r.name === recipe.name)) {
            favorites.push(recipe);
          }
        }
    
        localStorage.setItem("favorites", JSON.stringify(favorites));
        location.reload();
      };
      detailsbtn.onclick = function () {
        const allRecipes = JSON.parse(localStorage.getItem("allRecipes")) || [];
        const fullRecipe = allRecipes.find(r => r.name === recipename);
    
        const recipe = {
          name: fullRecipe.name,
          image: fullRecipe.image,
          title: fullRecipe.name,
          time: fullRecipe.time,
          noingredients: fullRecipe.noingredients,
          ingredients: fullRecipe.ingredients,
          instructions:fullRecipe.instructions
        };
    
        localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
        window.location.href = detailsbtn.getAttribute("data-target");
      };
    }
  }
  
  document.addEventListener("DOMContentLoaded", function () {//if i go to another page still the fav btn is orange
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  
    document.querySelectorAll(".recipe-card").forEach(card => {
      let favBtn = card.querySelector(".favorite-btn");
      let recipename = card.dataset.name;
      if (favorites.some(r => r.name === recipename)) {
        favBtn.style.color = '#D35400';  
        favBtn.classList.add("favorited");
      }
    });
  });

