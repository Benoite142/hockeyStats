const CURRENT_SCORE_API_URL = "https://api-web.nhle.com/v1/score/now";

const habsId = 8;
const sensId = 9

let previous_score = null;
const sound_player = require('play-sound')();;

async function fetchHabsGame(teamId) {
    try{
        const response = await fetch(CURRENT_SCORE_API_URL);
        const data = await response.json();
        const games = data.games || [];
        for (const game of games){
            const homeId = game.homeTeam.id;
            const homeName = game.homeTeam.abbrev;
            const awayId = game.awayTeam.id;
            const awayName = game.awayTeam.abbrev;
            const isHabsGame = homeId === teamId || awayId === teamId;

            if (isHabsGame){
                return{
                    id: game.id,
                    mtlScore: homeId === teamId ? game.homeTeam.score : game.awayTeam.score,
                    oppScore: homeId === teamId ? game.awayTeam.score : game.homeTeam.score,
                    mtlIsHome: homeId === teamId,
                    homeTeam: homeName,
                    awayTeam: awayName
                };
            }
        }
        return null;
    } catch(err){
        console.log(err);
    }
}

async function checkHabsGoal() {
    const currentGame = await fetchHabsGame(habsId);

    if(!currentGame){
        console.log("no current habs game");
        previous_score = null;
        return;
    }
    
    if(!previous_score){
        console.log("no new goal");
    }
    else if (currentGame.mtlScore > previous_score.mtlScore){
        sound_player.play('habsGoal.mp3', (err) =>{
            if (err) console.log(err);
        });
    }

    previous_score = currentGame;
}
