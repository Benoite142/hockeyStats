

const SEARCH_PLAYER_API_URL = "https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=20&q=";

const GET_SPECIFIC_PLAYER_STATS =  "https://api-web.nhle.com/v1/player/PLAYER_ID/landing";


const readline = require("readline");

async function searchForPlayer(search_players_name){
    if (!searchForPlayer) return [];
    try{
        const response = await fetch(SEARCH_PLAYER_API_URL + search_players_name);
        const data = await response.json() || [];
        return data;
    } catch(err){
        console.log(err);
        return [];
    }
}

function startLiveSearch(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    readline.emitKeypressEvents(process.stdin, rl);
    process.stdin.setRawMode(true);

    let input = "";

    process.stdin.on("keypress", async (str, key) => {
        if (key.name === "return"){
            input = "";
            console.clear;
            console.log("search cleared.");
            return;
            // go to other page with the search results
        }
        if (key.name === "backspace") {
            input = input.slice(0, -1);
        }else if (key.name === "space"){
            input += " ";
        } else if (key.sequence && key.name.length === 1) {
            input += key.sequence;
        } else if (key.ctrl && key.name === "c") {
            console.log("\nExiting...");
            process.exit();
        }
        console.clear();
        console.log("Search: " + input);

        const results = await searchForPlayer(input);
        for (const player of results) {
            console.log(`- ${player.name} (ID: ${player.playerId}, Active: ${player.active})`);
        }
    });
}


function type_in_players_name(){
    return readline.question("");
}
async function show_players() {
    const name = type_in_players_name();
    console.log(name);
    const data = await searchForPlayer(name);
    for (const player of data){
        const player_name = player.name;
        const player_ID = player.playerId;
        const isActive = player.active;

        console.log("Player's name: " + player_name);
    }
    
}

// console.log("Starting habs goal watcher");   
// checkHabsGoal();
// setInterval(checkHabsGoal, 10000);

// show_players();
// setInterval(show_players, 1000);

startLiveSearch();