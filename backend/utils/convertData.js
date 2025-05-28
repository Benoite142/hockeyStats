const positionDictionnary = new Map([
    ['L', 'Left Wing'],
    ['R', 'Right Wing'], 
    ['C', 'Center'], 
    ['D', 'Defense'], 
    ['G', 'Goalie']
]);


export function convertInchesInFoot(heightInInches){
    if (!heightInInches) return "";
    console.log(heightInInches);
    return `${Math.floor(heightInInches/12)}'${heightInInches % 12}`;
}

export function convertShoot(shootsCatches){
    if (!shootsCatches) return "";

    if (shootsCatches=== "L"){
        return "Left";
    }
    if (shootsCatches === "R"){
        return "Right";
    }
}

export function convertPosition(position){
    if (!position) return "";
    return positionDictionnary.get(position) || position;
    
}



// module.exports = {
//     convertInchesInFoot,
//     convertShoot,
//     convertPosition
// }; 