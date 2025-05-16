document.getElementById("searchBtn").addEventListener("click", async function () {
  const query = document.getElementById("searchInput").value.trim();
  const resultsContainer = document.getElementById("recipeList");
  resultsContainer.innerHTML = ""; 

  if (query === "") {
    resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  try {
    const response = await fetch(`/api/search-recipes/?search=${encodeURIComponent(query)}`);
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
        <a href="/recipe-details/${recipe.id}/"><button class="view-details">View Details</button></a>
      `;

      resultsContainer.appendChild(card);
    });

  } catch (error) {
    resultsContainer.innerHTML = "<p>Error loading recipes.</p>";
    console.error(error);
  }
});
