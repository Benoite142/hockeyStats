const params = new URLSearchParams(window.location.search);
const playerId = params.get("id") || params.get("playerId"); // Handle both 'id' and 'playerId' parameters
const playerName = params.get("player") || params.get("playerName"); // Handle both 'player' and 'playerName' parameters

const container = document.getElementById("player-stats");
let currentPlayerData = null;
window.currentPlayerData = null;

// Function to fetch player data by ID
function fetchPlayerById(id) {
  return fetch(`/stats?id=${id}`)
    .then(res => res.json());
}


// Function to search for player by name and then fetch their data
async function fetchPlayerByName(name) {
  try {
    // First, search for the player
    const searchResponse = await fetch(`/search?q=${encodeURIComponent(name)}`);
    const searchData = await searchResponse.json();

    if (searchData && searchData.length > 0) {
      // Find exact match or closest match
      const exactMatch = searchData.find(player =>
        `${player.name}`.toLowerCase() === name.toLowerCase()
      );

      const playerToUse = exactMatch || searchData[0];
      const playerData = await fetchPlayerById(playerToUse.playerId);
      currentPlayerData = playerData;
      window.currentPlayerData = playerData;

      return playerData;
    } else {
      throw new Error('Player not found');
    }
  } catch (error) {
    throw new Error(`Failed to find player: ${error.message}`);
  }
}

function renderPlayerContent(data) {
  const t = translator.getDynamicTranslations();

  const bioLines = `
    ${data.birthDate ? `<p><strong>${t.date_of_birth}:</strong> ${data.birthDate}</p>` : ""}
    ${data.birthCity ? `<p><strong>${t.birth_place}:</strong> ${data.birthCity}${data.birthStateProvince ? ', ' + data.birthStateProvince : ''}, ${data.birthCountry}</p>` : ""}
    ${data.heightInInches ? `<p><strong>${t.height}:</strong> ${data.heightInInches}</p>` : ""}
    ${data.weightInPounds ? `<p><strong>${t.weight}:</strong> ${data.weightInPounds} lbs</p>` : ""}
    ${data.shootsCatches ? `<p><strong>${t.shoots}:</strong> ${data.shootsCatches}</p>` : ""}
    ${data.position ? `<p><strong>${t.position}:</strong> ${data.position}</p>` : ""}
    ${data.team ? `<p><strong>${t.team}:</strong> ${data.team}</p>` : ""}
  `;

  // Check if career totals exist, if not show message
  const hasCareerStats = data.careerTotals && data.careerTotals.regularSeason;
  console.log('Career totals:', data.careerTotals); // Debug log

  // Enhanced player info display
  document.getElementById('playerInfo').innerHTML = `
    <div class="enhanced-player-card">
        <div class="player-background" style="background-image: url('${data.heroImage}');">
            <div class="player-background-overlay"></div>
            <div class="player-card-content">
              <div class="player-bio-content">
                <div class="player-bio-grid">${bioLines}</div>
                <div class="player-headshot-section">
                    <div class="player-headshot-wrapper">
                        <img src="${data.headshot}" alt="${data.firstName} ${data.lastName}" class="player-headshot-img">
                    </div>
                </div>
                <div class="player-jersey-number">${data.number ? `#${data.number}` : ''}</div>
              </div>
              
              <div class="player-info-content">
                <h1 class="player-full-name">${data.firstName} ${data.lastName}</h1>
                  <div class="player-career-stats">
                    <h1 class="career-stats-title">${t.career_stats}</h1>
                    ${hasCareerStats ? `
                      <table class="career-stats-table">
                        <thead>
                          <tr>
                            <th>${t.career_games_played}</th>
                            <th>${t.career_goals}</th>
                            <th>${t.career_assists}</th>
                            <th>${t.career_points}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>${data.careerTotals.regularSeason.gamesPlayed ?? '--'}</td>
                            <td>${data.careerTotals.regularSeason.goals ?? '--'}</td>
                            <td>${data.careerTotals.regularSeason.assists ?? '--'}</td>
                            <td>${data.careerTotals.regularSeason.points ?? '--'}</td>
                          </tr>
                        </tbody>
                      </table>
                    ` : `
                      <div class="no-career-stats">
                        <p>Career statistics not available for this player.</p>
                      </div>
                    `}
                  </div>    
              </div>
          </div>
        </div>
    </div>
  `;

  const seasonStats = data.position === "Goalie" ?
    getGoalieSeasonTotals(data.seasonTotals || [], t) :
    getPlayerSeasonTotals(data.seasonTotals || [], t);

  // Enhanced stats display
  document.getElementById('player-stats').innerHTML = `
      <div class="stats-content">
          ${seasonStats}
      </div>
  `;
}

async function loadPlayerData() {
  try {
    await translator.init();

    const t = translator.getDynamicTranslations();

    // Determine which method to use and fetch player data
    currentPlayerData = await (playerId ?
      fetchPlayerById(playerId) :
      playerName ?
        fetchPlayerByName(playerName) :
        Promise.reject(new Error('No player ID or name provided'))
    );

    window.currentPlayerData = currentPlayerData;
    window.renderPlayerContent = renderPlayerContent;


    // Show loading state
    document.getElementById('loading-container').style.display = 'block';
    document.getElementById('player-info-section').style.display = 'none';
    document.getElementById('player-stats-section').style.display = 'none';

    // Hide loading and show content
    document.getElementById('loading-container').style.display = 'none';
    document.getElementById('player-info-section').style.display = 'block';
    document.getElementById('player-stats-section').style.display = 'block';

    // Update page title
    document.title = `${currentPlayerData.firstName} ${currentPlayerData.lastName} - NHL Player Stats`;

    // Render the content
    renderPlayerContent(currentPlayerData);

  }
  catch (err) {
    const t = translator.getDynamicTranslations();
    // Hide loading and show error
    document.getElementById('loading-container').style.display = 'none';
    document.getElementById('player-info-section').style.display = 'block';
    document.getElementById('playerInfo').innerHTML = `
        <div class="error-state">
            <h2>${t.player_not_found}</h2>
            <p>${t.unable_to_load}</p>
            <div class="error-actions">
                <a href="index.html" class="nav-button primary">${t.back_to_search}</a>
                <button class="nav-button secondary" onclick="location.reload()">${t.try_again}</button>
            </div>
        </div>
    `;
    console.error(err);
  }
}


document.addEventListener('DOMContentLoaded', loadPlayerData);


function getGoalieSeasonTotals(seasonTotals, t) {
  if (!seasonTotals || seasonTotals.length === 0) return `<p>${t.no_season_stats}</p>`;

  const internationalLeaguesDictionary = {
    'OG': 'Olympic Games',
    'W-Cup': 'World Cup',
    'Olympics': 'Olympic Games',
    '4 Nations': '4 Nations Cup',
    'WC': 'World Championship',
    'WCup': 'World Cup',
    'WJC-A': 'World Junior Championship (U20)',
    'WC-A': 'World Championship (Senior)',
    'WJ18-A': 'World U18 Championship',
    'International': 'International',
    'WJC-20': 'World Junior Championship (U20)',
    'WJC-18': 'World U18 Championship',
    'WHC-17': 'World Hockey Challenge (U17)'
  }

  const playoffStats = seasonTotals.filter(season => season.gameTypeId === 3);
  const internationalStats = seasonTotals.filter(season => season.leagueAbbrev && internationalLeaguesDictionary[season.leagueAbbrev]);
  const regularSeasonStats = seasonTotals.filter(season => season.gameTypeId === 2 && (!season.leagueAbbrev || !internationalLeaguesDictionary[season.leagueAbbrev]));

  const createRows = (stats) => {
    return stats.map(season => {
      let formatedSeason = season.season.toString().slice(2, 4) + '-' + season.season.toString().slice(6, 8);
      return `
        <tr>
          <td style="background-color: #f1f5f9; font-weight: 700; border-right: 2px solid #cbd5e1;">${formatedSeason}</td>
          <td>${season.teamName?.default || 'N/A'}</td>
          <td>${season.leagueAbbrev ?? '--'}</td>
          <td>${season.gamesPlayed ?? '--'}</td>
          <td>${season.wins ?? '--'}</td>
          <td>${season.losses ?? '--'}</td>
          <td>${season.otLosses ?? '--'}</td>
          <td>${season.shotsAgainst ?? '--'}</td>
          <td>${season.goalsAgainst ?? '--'}</td>
          <td>${season.goalsAgainstAvg ? parseFloat(season.goalsAgainstAvg).toFixed(3) : '--'}</td>
          <td>${season.savePctg ? parseFloat(season.savePctg).toFixed(3) : '--'}</td>
          <td>${season.shutouts ?? '--'}</td>
          <td>${season.timeOnIce ?? '--'}</td>
        </tr>
      `;
    }).join('');
  };

  const regularSeasonRows = createRows(regularSeasonStats);
  const playoffRows = createRows(playoffStats);
  const internationalRows = createRows(internationalStats);

  return `
    <div class="stats-section-header">
      <button class="nav-button primary active" onclick="toggleStats('regular')" id="regular-btn">Season Stats</button>
      <button class="nav-button primary" onclick="toggleStats('playoffs')" id="playoffs-btn">Playoffs Stats</button>
      <button class="nav-button primary" onclick="toggleStats('international')" id="international-btn">International Stats</button>
    </div>
    <div class="table-container">
    
      <div id="regular-stats" class="stats-section">
        ${regularSeasonStats.length > 0 ? `
          <h3 class="section-header">Regular Season Statistics</h3>
          <table class="stats-table">
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
              ${regularSeasonRows}
            </tbody>
          </table>
        ` : '<p>No regular season stats available.</p>'}
      </div>
      
      <div id="playoffs-stats" class="stats-section" style="display: none;">
        ${playoffStats.length > 0 ? `
          <h3 class="section-header">Playoffs Statistics</h3>
          <table class="stats-table">
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
              ${playoffRows}
            </tbody>
          </table>
        ` : '<p>No playoff stats available.</p>'}
      </div>

      <div id="international-stats" class="stats-section" style="display: none;">
        ${internationalStats.length > 0 ? `
          <h3 class="section-header">International Statistics</h3>
          <table class="stats-table">
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
              ${internationalRows}
            </tbody>
          </table>
        ` : '<p>No international stats available.</p>'}
      </div>
    </div>
  `;
}


function getPlayerSeasonTotals(seasonTotals) {
  if (!seasonTotals || seasonTotals.length === 0) return "<p>No season stats available.</p>";

  const internationalLeaguesDictionary = {
    'OG': 'Olympic Games',
    'Olympics': 'Olympic Games',
    '4 Nations': '4 Nations Cup',
    'WC': 'World Championship',
    'W-Cup': 'World Cup',
    'WCup': 'World Cup',
    'WJC-A': 'World Junior Championship (U20)',
    'WC-A': 'World Championship (Senior)',
    'WJ18-A': 'World U18 Championship',
    'International': 'International',
    'WJC-20': 'World Junior Championship (U20)',
    'WJC-18': 'World U18 Championship',
    'WHC-17': 'World Hockey Challenge (U17)',

  }

  const playoffStats = seasonTotals.filter(season => season.gameTypeId === 3);
  const internationalStats = seasonTotals.filter(season => season.leagueAbbrev && internationalLeaguesDictionary[season.leagueAbbrev]);
  const regularSeasonStats = seasonTotals.filter(season => season.gameTypeId === 2 && (!season.leagueAbbrev || !internationalLeaguesDictionary[season.leagueAbbrev])); // Exclude international stats from regular season

  const createRows = (stats) => {
    return stats.map(season => {
      let formatedSeason = season.season.toString().slice(2, 4) + '-' + season.season.toString().slice(6, 8);
      return `
      <tr>
        <td style="background-color: #f1f5f9; font-weight: 700; border-right: 2px solid #cbd5e1;">${formatedSeason}</td>
        <td>${season.teamName?.default ?? "--"}</td>
        <td>${season.leagueAbbrev ?? "--"}</td>
        <td>${season.gamesPlayed ?? "--"}</td>
        <td>${season.goals ?? "--"}</td>
        <td>${season.assists ?? "--"}</td>
        <td>${season.points ?? "--"}</td>
        <td>${season.plusMinus ?? "--"}</td>
        <td>${season.pim ?? "--"}</td>
        <td>${season.gameWinningGoals ?? "--"}</td>
        <td>${season.otGoals ?? "--"}</td>
        <td>${season.powerPlayGoals ?? "--"}</td>
        <td>${season.powerPlayPoints ?? "--"}</td>
        <td>${season.shorthandedGoals ?? "--"}</td>
        <td>${season.shorthandedPoints ?? "--"}</td>
        <td>${season.shootingPctg ? parseFloat(season.shootingPctg).toFixed(3) : "--"}</td>
        <td>${season.shots ?? "--"}</td>
        <td>${season.avgToi ?? "--"}</td>
        <td>${season.faceoffWinningPctg ? parseFloat(season.faceoffWinningPctg).toFixed(3) : "--"}</td>
      </tr>
      `;
    }).join('');
  };

  const regularSeasonRows = createRows(regularSeasonStats);
  const playoffRows = createRows(playoffStats);
  const internationalRows = createRows(internationalStats);

  return `
    <div class="stats-section-header">
      <button class="nav-button primary active" onclick="toggleStats('regular')" id="regular-btn">Season
                          Stats</button>
      <button class="nav-button primary" onclick="toggleStats('playoffs')" id="playoffs-btn">Playoffs
                          Stats</button>
      <button class="nav-button primary" onclick="toggleStats('international')"
                          id="international-btn">International Stats</button>
    </div>
    <div class="table-container">
    
    
    <div id="regular-stats" class="stats-section">
        ${regularSeasonStats.length > 0 ? `
          <h3 class="section-header">Regular Season Statistics</h3>
          <table class="stats-table">
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
              ${regularSeasonRows}
            </tbody>
          </table>
        ` : '<p>No regular season stats available.</p>'}
      </div>
      
      <div id="playoffs-stats" class="stats-section" style="display: none;">
        ${playoffStats.length > 0 ? `
          <h3 class="section-header">Playoffs Statistics</h3>
          <table class="stats-table">
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
              ${playoffRows}
            </tbody>
          </table>
        ` : '<p>No playoff stats available.</p>'}
      </div>

      <div id="international-stats" class="stats-section" style="display: none;">
      ${internationalStats.length > 0 ? `
        <h3 class="section-header">International Statistics</h3>
        <table class="stats-table">
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
            ${internationalRows}
          </tbody>
        </table>
      ` : '<p>No international stats available.</p>'}
    </div>
    </div>
  `;

}


function toggleStats(type) {
  const regularStats = document.getElementById('regular-stats');
  const playoffStats = document.getElementById('playoffs-stats');
  const internationalStats = document.getElementById('international-stats');
  const internationalBtn = document.getElementById('international-btn');
  const regularBtn = document.getElementById('regular-btn');
  const playoffBtn = document.getElementById('playoffs-btn');

  if (type === 'regular') {
    regularStats.style.display = 'block';
    playoffStats.style.display = 'none';
    internationalStats.style.display = 'none';
    regularBtn.classList.add('active');
    playoffBtn.classList.remove('active');
    internationalBtn.classList.remove('active');
  } else if (type === 'playoffs') {
    regularStats.style.display = 'none';
    playoffStats.style.display = 'block';
    internationalStats.style.display = 'none';
    regularBtn.classList.remove('active');
    playoffBtn.classList.add('active');
    internationalBtn.classList.remove('active');
  } else if (type === 'international') {
    internationalStats.style.display = 'block';
    regularStats.style.display = 'none';
    playoffStats.style.display = 'none';
    regularBtn.classList.remove('active');
    playoffBtn.classList.remove('active');
    internationalBtn.classList.add('active');
  }
}