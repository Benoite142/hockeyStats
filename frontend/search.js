const input = document.getElementById("search");
const resultsDiv = document.getElementById("results");

input.addEventListener("input", async () => {
  const query = input.value.trim();
  if (query.length === 0) {
    resultsDiv.innerHTML = "";
    return;
  }

  const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  resultsDiv.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Position</th>
          <th>Last Team played for</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(p => `
          <tr>
            <td><a href="javascript:void(0);" class="player-link" data-id="${p.playerId}">${p.name}</a></td>
            <td>${p.positionCode ?? 'N/A'}</td>
            <td>${p.lastTeamAbbrev ?? 'N/A'}</td>
            <td>${p.active}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    `;
  document.querySelectorAll(".player-link").forEach(link => {
    link.addEventListener("click", () => {
      const playerId = this.getAttribute("data-id");
      window.location.href = `/playerStats.html?id=${playerId}`;
    });
  });
});
