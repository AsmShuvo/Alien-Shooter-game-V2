// This script loads and displays the leaderboard data.
(function () {
  // Get the table body element
  const tbody = document.querySelector("#leaderboardTable tbody");
  // Load the leaderboard data from local storage
  const lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  // If there's no data, show a message
  if (!lb || lb.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No scores yet</td></tr>';
    return;
  }
  // Sort the scores from highest to lowest
  lb.sort((a, b) => b.score - a.score);
  // Create and add a table row for each of the top 50 entries
  lb.slice(0, 50).forEach((entry, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${idx + 1}</td><td>${entry.name || ""}</td><td>${
      entry.email
    }</td><td>${entry.score}</td>`;
    tbody.appendChild(tr);
  });
})();
