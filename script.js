let glyphs = [];
let remainingGlyphs = [];
let ipaAudio = {};
let glyphsLoaded = false;
let currentGlyph;
let selectedAnswer;
let correctAnswer;

let gameMode = "script";

let score = 0;
let total = 0;

let answered = false;

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
    fetch("data/latin.json").then(r => r.json())

])

.then(files => {


    glyphs = files.flat();


    console.log(
    "SUCCESS:",
    glyphs.length,
    "glyphs loaded"
    );


    glyphsLoaded = true;


})

.catch(error => {


    alert(
    "JSON ERROR - check console"
    );


    console.error(error);


});

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


  document.getElementById("result").innerHTML =
`
✅ Correct
<br>
<span class="answerReveal">${correctAnswer}</span>
`
+ info;



} else {


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

}

function returnMenu(){

document.getElementById("howToPlay").style.display =
"none";

document.getElementById("traditions").style.display =
"none";
    score = 0;
    total = 0;


    updateScore();


    document.getElementById("game").style.display =
    "none";


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