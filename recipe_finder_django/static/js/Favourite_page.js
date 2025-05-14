document.addEventListener("DOMContentLoaded", function () { 
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const container = document.getElementsByClassName("favorites-container")[0];

  favorites.forEach(Recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.dataset.name = Recipe.name; 

    card.innerHTML = `
      <img src="${Recipe.image}" alt="">
      <h3>${Recipe.title}</h3>
      <p>${Recipe.description}</p>
      <div class="buttons-container">
        <button class="favorite-btn" style="color: #D35400;"><i class="fa fa-heart"></i></button>
        <button class="recipe-details" data-target="Recipe_details_Page.html">View details</button>
      </div>
    `;
    const viewBtn = card.querySelector(".recipe-details");
viewBtn.addEventListener("click", function () {
  const recipe = {
    name: Recipe.name,
    image: Recipe.image,
    title: Recipe.name,
    time: Recipe.time,
    noingredients: Recipe.noingredients,
    ingredients: Recipe.ingredients,
    instructions: Recipe.instructions
  };
  localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  window.location.href = viewBtn.getAttribute("data-target");
});

    container.appendChild(card);
});

  const favbtns = document.getElementsByClassName("favorite-btn");
  for (let i = 0; i < favbtns.length; i++) {
    favbtns[i].onclick = function () {
      const btn = favbtns[i];
      const card = btn.closest(".recipe-card");
      const recipeName = card.dataset.name;

      favorites = favorites.filter(r => r.name !== recipeName);
      localStorage.setItem("favorites", JSON.stringify(favorites));

      card.remove();
    };
  }
  
});

