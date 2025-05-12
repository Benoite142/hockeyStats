const params = new URLSearchParams(window.location.search);
const playerId = params.get("id");

const container = document.getElementById("player-stats");

fetch(`/stats?id=${playerId}`)
.then(res=> res.json())
.then(data =>{
    document.body.innerHTML = `
    <div class="playerInfo">
      <div class="playerHeadshot">
        <img src = "${data.headshot}" alt="player headshot">
      </div>
      <h1>${data.firstName.default} ${data.lastName.default} #${data.sweaterNumber}</h1>
      <p><strong>Birth Date:</strong> ${data.birthDate}</p>
      <p><strong>Height:</strong> ${data.heightInInches} inches</p>
      <p><strong>Weight:</strong> ${data.weightInPounds} lbs</p>
      <p><strong>Shoots:</strong> ${data.shootsCatches}</p>
      <p><strong>Position:</strong> ${data.position}</p>
      <p><strong>Team:</strong> ${data.currentTeamAbbrev || 'N/A'}</p>
    </div>
    `;
  })
  .catch(err => {
    document.body.innerHTML = `<p>Error fetching player data.</p>`;
    console.error(err);
  });


  /*  

  */
// async function fetchPlayerStats(id) {

//         const {firstName, lastName, birthDate, heightInInches, weightInPounds, shootsCatches, position, currentTeamAbbrev} = data.player;
//         const stats = data.stats?.regularSeason?.career;

//         container.innerHTML = `
//       <h1>${firstName} ${lastName}</h1>
//       <p><strong>Birth Date:</strong> ${birthDate}</p>
//       <p><strong>Height:</strong> ${heightInInches} inches</p>
//       <p><strong>Weight:</strong> ${weightInPounds} lbs</p>
//       <p><strong>Shoots:</strong> ${shootsCatches}</p>
//       <p><strong>Position:</strong> ${position}</p>
//       <p><strong>Team:</strong> ${currentTeamAbbrev || 'N/A'}</p>

//       ${stats ? `
//         <h2>Career Stats</h2>
//         <p>Games: ${stats.games}</p>
//         <p>Goals: ${stats.goals}</p>
//         <p>Assists: ${stats.assists}</p>
//         <p>Points: ${stats.points}</p>
//       ` : `<p>No career stats available.</p>`}
//     `;
//     }
//     catch(err){
//         container.innerHTML = `<p>Error fetching stats</p>`;
//         console.log(err);
//     }

    
// }
