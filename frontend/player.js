const params = new URLSearchParams(window.location.search);
const playerId = params.get("id");

const container = document.getElementById("player-stats");

fetch(`/stats?id=${playerId}`)
.then(res=> res.json())
.then(data =>{

  const bioLines = `
  ${data.birthDate ? `<p><strong>Birth Date:</strong> ${data.birthDate}</p>` : ""}
  ${data.heightInInches ? `<p><strong>Height:</strong> ${data.heightInInches}</p>` : ""}
  ${data.weightInPounds ? `<p><strong>Weight:</strong> ${data.weightInPounds} lbs</p>` : ""}
  ${data.shootsCatches ? `<p><strong>Shoots:</strong> ${data.shootsCatches}</p>` : ""}
  ${data.position ? `<p><strong>Position:</strong> ${data.position}</p>` : ""}
  ${data.team ? `<p><strong>Team:</strong> ${data.team}</p>` : ""}
`;
  const seasonStats = getGoalieSeasonTotals(data.seasonTotals || []);

  
    document.body.innerHTML = `
    <div class="playerInfo">
      <div class="backgroundImage" style="background-image: url('${data.heroImage}');"></div>
      <div class="playerContent">
        <div class="playerHeadshot">
          <img src = "${data.headshot}" alt="player headshot">
        </div>
        <div class="playerBio">
          <h1>${data.firstName} ${data.lastName} </h1>
          ${bioLines}
        </div>
      </div>
      <div class="playerNumber">
            <p> ${data.number? data.number: ""}<p>
        </div>
    </div>
    <div class="playerStats">
      ${seasonStats}
    </div>`;
  })
  .catch(err => {
    document.body.innerHTML = `<p>Error fetching player data.</p>`;
    console.error(err);
  });


function getGoalieSeasonTotals(seasonTotals) {
  if (!seasonTotals || seasonTotals.length === 0) return "<p>No season stats available.</p>";

  const rows = seasonTotals.map(season => `
    <tr>
      <td>${season.season}</td>
      <td>${season.teamName?.default || 'N/A'}</td>
      <td>${season.leagueAbbrev}</td>
      <td>${season.gamesPlayed? season.gamesPlayed: '--'}</td>
      <td>${season.wins? season.wins: '0'}</td>
      <td>${season.losses? season.losses: '0'}</td>
      <td>${season.otLosses? season.otLosses: '0'}</td>
      <td>${season.shotsAgainst? season.shotsAgainst: '--'}</td>
      <td>${season.goalsAgainst? season.goalsAgainst: '--'}</td>
      <td>${season.goalsAgainstAvg? season.goalsAgainstAvg: '--'}</td>
      <td>${season.savePctg? season.savePctg: '--'}</td>
      <td>${season.shutouts? season.shutouts: '0'}</td>
      <td>${season.timeOnIce? season.timeOnIce: '--'}</td>
    </tr>
  `).join('');

  return `
    <table class="season-table">
      <thead>
        <tr>
          <th>Season</th>
          <th>Team</th>
          <th>League</th>
          <th>GP</th>
          <th>W</th>
          <th>L</th>
          <th>OTL</th>
          <th>SA</th>
          <th>GA</th>
          <th>GAA</th>
          <th>SV%</th>
          <th>SO</th>
          <th>TOI</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}
