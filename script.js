let glyphs = [];
let remainingGlyphs = [];
let ipaAudio = {};
let glyphsLoaded = false;
let currentGlyph;
let selectedAnswer;
let correctAnswer;
let answerHistory = [];

let gameMode = "script";
let roundType = "daily";
let today = new Date().toDateString();

let score = 0;
let total = 0;

let answered = false;


let daysPlayed = Number(localStorage.getItem("daysPlayed")) || 0;

let lastPlayedDate =
localStorage.getItem("lastPlayedDate") || "";


const maxQuestions = 15;

async function loadIPA() {
  let response = await fetch("data/ipa_audio.json");
  ipaAudio = await response.json();
}


Promise.all([

    fetch("data/arabic.json").then(r => r.json()),
    fetch("data/cyrillic.json").then(r => r.json()),
    fetch("data/geez.json").then(r => r.json()),
    fetch("data/greek.json").then(r => r.json()),
    fetch("data/hebrew.json").then(r => r.json()),
    fetch("data/latin.json").then(r => r.json()),
        fetch("data/phoenician.json").then(r => r.json())


])

.then(files => {


    glyphs = files.flat();


    console.log(
    "SUCCESS:",
    glyphs.length,
    "glyphs loaded"
    );


    glyphsLoaded = true;

    checkDailyVisit();

})

.catch(error => {


    alert(
    "JSON ERROR - check console"
    );


    console.error(error);


});


function checkDailyVisit(){

    const today = new Date().toISOString().split("T")[0];

    if(lastPlayedDate !== today){

        daysPlayed++;

        lastPlayedDate = today;

        localStorage.setItem(
            "daysPlayed",
            daysPlayed
        );

        localStorage.setItem(
            "lastPlayedDate",
            today
        );

    }

}


function playSound() {


    if(!currentGlyph){

        console.log("No glyph selected");
        return;

    }


    let soundKey =
    currentGlyph.ipa[0];


    console.log(
    "Trying to play:",
    soundKey
    );


    let soundFile =
    ipaAudio[soundKey];


    if(!soundFile){

        console.log(
        "Missing sound:",
        soundKey
        );

        return;

    }


    console.log(
    "File:",
    soundFile
    );


    let audio =
    new Audio(soundFile);


    audio.play()
    .catch(error => {

        console.log(
        "Audio failed:",
        error
        );

    });


}

async function startGame(mode){

if(!glyphsLoaded){

    alert("Loading letters...");
    return;

}
await loadIPA();

    gameMode = mode;

    document.getElementById("roundType").innerHTML =
roundType.toUpperCase() + " ROUND";

    let playedToday =
localStorage.getItem(mode + "_daily_date");


if(playedToday === today){

    roundType = "free";

}
else{

    roundType = "daily";

}


    document.getElementById("menu").style.display =
    "none";


    document.getElementById("game").style.display =
    "block";


  if(mode === "script"){

    document.getElementById("modeTitle").innerHTML =
    "Guess the Script";

    document.getElementById("soundButton").style.display =
    "none";

}


if(mode === "sound"){

    document.getElementById("modeTitle").innerHTML =
    "Guess the Sound";

    document.getElementById("soundButton").style.display =
    "inline";

}


if(mode === "glyph"){

    document.getElementById("modeTitle").innerHTML =
    "Guess the Glyph";

    document.getElementById("soundButton").style.display =
    "none";

}

 

score = 0;
total = 0;
answerHistory = [];

if(gameMode === "sound"){

    remainingGlyphs =
    glyphs.filter(glyph =>
        glyph.ipa.length > 0 &&
        ipaAudio[glyph.ipa[0]]
    );

}
else{

    remainingGlyphs =
    [...glyphs];

}

updateScore();

newRound();

}


function updateScore(){

    document.getElementById("score").innerHTML = score;
    document.getElementById("total").innerHTML = total;

}



function newRound(){


    if(total >= maxQuestions){

        endGame();
        return;

    }


    selectedAnswer = null;
    answered = false;


    document.getElementById("result").innerHTML = "";


    let randomIndex =
    Math.floor(Math.random()*remainingGlyphs.length);


    currentGlyph =
    remainingGlyphs[randomIndex];


    remainingGlyphs.splice(randomIndex,1);



if(gameMode === "script"){

    document.getElementById("glyph").innerHTML =
    currentGlyph.glyph;

}


if(gameMode === "sound"){

    document.getElementById("glyph").innerHTML =
    "🔊";

   

}
if(gameMode === "sound"){

    document.getElementById("glyph").onclick =
    playSound;

}
else{

    document.getElementById("glyph").onclick =
    null;

}

if(gameMode === "glyph"){

    document.getElementById("glyph").innerHTML =
    currentGlyph.name;

}

if(gameMode === "script"){

    correctAnswer = currentGlyph.script;

}


if(gameMode === "sound"){

    correctAnswer = currentGlyph.glyph;

}


if(gameMode === "glyph"){

    correctAnswer = currentGlyph.glyph;

}


let answers =
[correctAnswer];



while(answers.length < 4){


   let sourceList;

if(gameMode === "sound"){
    sourceList = remainingGlyphs;
}
else{
    sourceList = glyphs;
}

let randomGlyph =
sourceList[Math.floor(Math.random()*sourceList.length)];


    let randomAnswer;


    if(gameMode === "script"){

        randomAnswer = randomGlyph.script;

    }


    if(gameMode === "sound"){

        randomAnswer = randomGlyph.glyph;

    }


    if(gameMode === "glyph"){

        randomAnswer = randomGlyph.glyph;

    }



    if(!answers.includes(randomAnswer)){

        answers.push(randomAnswer);

    }


}


    answers.sort(()=>Math.random()-0.5);



    let box =
    document.getElementById("choices");


    box.innerHTML = "";



    answers.forEach(answer => {


        let button =
        document.createElement("button");


        button.innerHTML = answer;
        button.className = "choice";



        button.onclick = () => {


            if(answered){
                return;
            }



            selectedAnswer = answer;



            document.querySelectorAll(".choice")
            .forEach(b => b.classList.remove("selected"));



            button.classList.add("selected");

        };


        box.appendChild(button);


    });


}



document.getElementById("lock").onclick = () => {


    if(answered){
        return;
    }



    if(!selectedAnswer){


        document.getElementById("result").innerHTML =
        "Choose an answer first.";


        return;

    }



    answered = true;

    total++;



let info = `
<br><br>
<strong>${currentGlyph.name}</strong>
<br>
Glyph ${currentGlyph.order} of the ${currentGlyph.script} script
<br>
Transliteration: ${currentGlyph.transliteration}
`;




if(gameMode === "script"){
    correctAnswer = currentGlyph.script;
}


if(gameMode === "sound"){
    correctAnswer = currentGlyph.glyph;
}


if(gameMode === "glyph"){
    correctAnswer = currentGlyph.glyph;
}



if(selectedAnswer === correctAnswer){

    score++;

     answerHistory.push("🟩");


  document.getElementById("result").innerHTML =
`
✅ Correct
<br>
<span class="answerReveal">${correctAnswer}</span>
`
+ info;



} else {

     answerHistory.push("🟥");

    document.getElementById("result").innerHTML =
    `
    ❌ Wrong. It was 
    <br>
    <span class="answerReveal">${correctAnswer}</span>
    `
    + info;


}



    updateScore();


};




function nextQuestion(){


    if(!answered){


        document.getElementById("result").innerHTML =
        "Lock in your answer first.";


        return;


    }


    newRound();


}





function endGame(){

    let lifetimeScore =
Number(
localStorage.getItem("daily_total_score") || 0
);


let lifetimeRounds =
Number(
localStorage.getItem("daily_rounds_played") || 0
);



localStorage.setItem(
"daily_total_score",
lifetimeScore + score
);



localStorage.setItem(
"daily_rounds_played",
lifetimeRounds + 1
);

if(roundType === "daily"){

    localStorage.setItem(
    gameMode + "_daily_date",
    today
    );
let oldHigh =
localStorage.getItem(gameMode + "_highscore") || 0;


if(score > oldHigh){

    localStorage.setItem(
    gameMode + "_highscore",
    score
    );

}
}
loadHighScores();
loadDailyStatus();
loadOverallRank();
document.querySelector("h2").style.display = "none";

document.getElementById("choices").innerHTML = "";

    let rank = "";

    if(score <= 5){

        rank = "Illiterate Chump";

    }
    else if(score <= 10){

        rank = "Scribe";

    }
    else {

        rank = "Translator";

    }



    let image = "";


if(score <= 5){

    image = "images/chump.png";

}
else if(score <= 10){

    image = "images/scribe.png";

}
else {

    image = "images/translator.png";

}



document.getElementById("glyph").innerHTML =
`
<img 
src="${image}" 
width="250">
`;


document.getElementById("result").innerHTML =
`
You achieved...
<br><br>

Final Score: ${score}/${maxQuestions}

<br><br>

Rank:<br>
<strong>${rank}</strong>
`;

document.getElementById("lock").style.display = "none";

document.getElementById("nextButton").style.display = "none";
document.getElementById("soundButton").style.display =
"none";

document.getElementById("restartButton").style.display = "inline";

document.getElementById("shareButton").style.display =
"inline";

}

function returnMenu(){




    // hide all pages

    document.getElementById("game").style.display =
    "none";


        document.getElementById("statsPage").style.display =
    "none";

    document.getElementById("howToPlay").style.display =
    "none";


    document.getElementById("traditions").style.display =
    "none";


    document.querySelectorAll(".scriptInfo")
    .forEach(page => {

        page.style.display =
        "none";

    });


    // show menu

    document.getElementById("menu").style.display =
    "block";


    

    document.getElementById("restartButton").style.display =
    "none";


    document.getElementById("lock").style.display =
    "inline";


    document.getElementById("nextButton").style.display =
    "inline";


    document.querySelector("h2").style.display =
    "block";


    document.getElementById("result").innerHTML =
    "";


}


function showHowToPlay(){

    document.getElementById("menu").style.display =
    "none";

    document.getElementById("howToPlay").style.display =
    "block";

}


function showTraditions(){

    document.getElementById("menu").style.display =
    "none";

    document.getElementById("traditions").style.display =
    "block";

}

function loadHighScores(){


    document.getElementById("scriptHigh").innerHTML =
    localStorage.getItem("script_highscore") || 0;


    document.getElementById("soundHigh").innerHTML =
    localStorage.getItem("sound_highscore") || 0;


    document.getElementById("glyphHigh").innerHTML =
    localStorage.getItem("glyph_highscore") || 0;


}

loadHighScores();
loadDailyStatus();
loadOverallRank();

function loadDailyStatus(){


    let today =
    new Date().toDateString();


    let modes =
    ["script", "sound", "glyph"];


    modes.forEach(mode => {


        let played =
        localStorage.getItem(
        mode + "_daily_date"
        );


        let status =
        document.getElementById(
        mode + "Status"
        );


        if(played === today){


            status.innerHTML =
            "✓ Free Play";


        }
        else{


            status.innerHTML =
            "☀️ Daily Available";


        }


    });


}

function shareScore(){


let grid = "";


answerHistory.forEach((box,index)=>{


    grid += box;


    if((index + 1) % 5 === 0){

        grid += "\n";

    }


});


let text =
`
Scryble 📝

${document.getElementById("modeTitle").innerHTML}
${roundType.toUpperCase()} ROUND

Score: ${score}/${maxQuestions}

${grid}
`;


navigator.clipboard.writeText(text);


alert("Result copied!");

}

function loadOverallRank(){



    
let totalScore =
Number(
localStorage.getItem("daily_total_score") || 0
);


let rounds =
Number(
localStorage.getItem("daily_rounds_played") || 0
);



let average = 0;


if(rounds > 0){

    average =
    totalScore / rounds;

}



let rank =
"✏️ Pen Cap Chewer";



if(rounds >= 50 && average >= 14){

    rank =
    "🌍 Linguist";

}
else if(rounds >= 25 && average >= 12){

    rank =
    "📜 Scholar";

}
else if(rounds >= 10 && average >= 9){

    rank =
    "🖋️ Copyist";

}
else if(rounds >= 3 && average >= 5){

    rank =
    "📖 Apprentice";

}



document.getElementById("rankName").innerHTML =
rank;


document.getElementById("averageScore").innerHTML =
average.toFixed(1);


document.getElementById("dailyRounds").innerHTML =
rounds;


document.getElementById("daysPlayed").innerHTML =
daysPlayed;

}

function showStats(){


document.getElementById("menu").style.display =
"none";


document.getElementById("statsPage").style.display =
"block";


loadHighScores();

loadOverallRank();


}

function showScriptPage(page){


    document.getElementById("traditions").style.display =
    "none";


    document.getElementById(page).style.display =
    "block";


}



function backToTraditions(){


    document.querySelectorAll(".scriptInfo")
    .forEach(page => {


        page.style.display =
        "none";


    });



    document.getElementById("traditions").style.display =
    "block";


}