document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementsByClassName("favorites-container")[0];
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

if (!token) {
  container.innerHTML = `<p class="no-recipes">Please log in to view favorites.</p>`;
  return;
}


  try {
    const response = await fetch("/api/favorites/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();

if (!response.ok) {
  console.error("API error:", result);
  container.innerHTML = `<p class="no-recipes">${result.error || "Error fetching favorites."}</p>`;
  return;
}

const favorites = result.favorites || [];
if (favorites.length === 0) {
  container.innerHTML = `<p class="no-recipes">No favorites found.</p>`;
  return;
}
    favorites.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      card.dataset.id = recipe.id;
      card.dataset.name = recipe.name;

      card.innerHTML = `
        <img src="${recipe.image}" alt="">
        <h3>${recipe.name}</h3>
        <p>${recipe.description}</p>
        <div class="buttons-container">
          <button class="favorite-btn" style="color: #D35400;"><i class="fa fa-heart"></i></button>
          <button class="recipe-details" data-target="Recipe_details_Page.html">View details</button>
        </div>
      `;

      const viewBtn = card.querySelector(".recipe-details");
      viewBtn.addEventListener("click", () => {
        window.location.href = `/api/recipe/${recipe.id}/`;
      });

      const favBtn = card.querySelector(".favorite-btn");
      favBtn.addEventListener("click", async () => {
        try {
          const toggleResponse = await fetch(`/api/favorites/toggle/${recipe.id}/`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          });

          const toggleResult = await toggleResponse.json();
          if (toggleResponse.ok && toggleResult.status === "removed") {
            card.remove(); 
          } else {
            console.warn("Unexpected toggle result:", toggleResult);
          }
        } catch (err) {
          console.error("Failed to toggle favorite:", err);
        }
      });

      container.appendChild(card);
    });
  } 
  catch (error) 
  {
    console.error("Failed to fetch favorites:", error);
    container.innerHTML = `<p class="no-recipes">Error fetching recipes. Try again later.</p>`;
  }
});

