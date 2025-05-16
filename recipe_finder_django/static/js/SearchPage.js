document.getElementById("searchInput").addEventListener("input", async function () {
  const query = this.value.trim();
  const resultsContainer = document.getElementById("resultsContainer");
  resultsContainer.innerHTML = ""; 
  if (query === "") return;
  try {
    const response = await fetch(`https://api.example.com/recipes?search=${query}`);
    const data = await response.json();

    if (data.length === 0) {
      resultsContainer.innerHTML = "<p>No recipes found.</p>";
      return;
    }
    data.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";

      card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
        <p>${recipe.description.slice(0, 100)}...</p>
        <button class="view-details" data-id="${recipe.id}">View Details</button>
      `;
      resultsContainer.appendChild(card);
    });
    document.querySelectorAll(".view-details").forEach(button => {
      button.addEventListener("click", function () {
        const recipeId = this.dataset.id;
        localStorage.setItem("selectedRecipeId", recipeId);
        window.location.href = "details.html";
      });
    });
  } catch (error) {
    resultsContainer.innerHTML = "<p>Error loading recipes.</p>";
    console.error(error);
  }
});
