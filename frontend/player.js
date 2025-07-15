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
  const seasonStats = data.position === "Goalie"? getGoalieSeasonTotals(data.seasonTotals || []): getPlayerSeasonTotals(data.seasonTotals || []);

  
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
      <td>${season.gamesPlayed?? '--'}</td>
      <td>${season.wins?? '--'}</td>
      <td>${season.losses?? '--'}</td>
      <td>${season.otLosses?? '--'}</td>
      <td>${season.shotsAgainst?? '--'}</td>
      <td>${season.goalsAgainst?? '--'}</td>
      <td>${season.goalsAgainstAvg?? '--'}</td>
      <td>${season.savePctg?? '--'}</td>
      <td>${season.shutouts?? '--'}</td>
      <td>${season.timeOnIce?? '--'}</td>
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


function getPlayerSeasonTotals(seasonTotals) {
  if(!seasonTotals || seasonTotals.length === 0) return "<p>No season stats available.</p>";
  
  const rows = seasonTotals.map(season => {
    let formatedSeason = season.season.toString().slice(2,4) +'-'+ season.season.toString().slice(6,8);
  return `
    <tr>
      <td>${formatedSeason}</td>
      <td>${season.leagueAbbrev?? "--"}</td>
      <td>${season.teamName.default?? "--"}</td>
      <td>${season.gamesPlayed?? "--"}</td>
      <td>${season.goals?? "--"}</td>
      <td>${season.assists?? "--"}</td>
      <td>${season.points?? "--"}</td>
      <td>${season.plusMinus?? "--"}</td>
      <td>${season.pim?? "--"}</td>
      <td>${season.gameWinningGoals?? "--"}</td>
      <td>${season.otGoals?? "--"}</td>
      <td>${season.powerPlayGoals?? "--"}</td>
      <td>${season.powerPlayPoints?? "--"}</td>
      <td>${season.shorthandedGoals?? "--"}</td>
      <td>${season.shorthandedPoints?? "--"}</td>
      <td>${season.shootingPctg?? "--"}</td>
      <td>${season.shots?? "--"}</td>
      <td>${season.avgToi?? "--"}</td>
      <td>${season.faceoffWinningPctg?? "--"}</td>
    </tr>
    `;
}).join('');
  
  return `
    <table class="season-table">
      <thead>
        <tr>
          <th>Season</th>
          <th>Team</th>
          <th>League</th>
          <th>GP</th>
          <th>Goals</th>
          <th>Ast</th>
          <th>Pts</th>
          <th>+/-</th>
          <th>PIM</th>
          <th>GWG</th>
          <th>OtG</th>
          <th>PPG</th>
          <th>PPP</th>
          <th>ShG</th>
          <th>ShP</th>
          <th>Shot%</th>
          <th>Shots</th>
          <th>AvgTOI</th>
          <th>FO%</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}