let glyphs = [];
let remainingGlyphs = [];

let currentGlyph;
let selectedAnswer;

let score = 0;
let total = 0;

let answered = false;

const maxQuestions = 15;


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

    remainingGlyphs = [...glyphs];

    updateScore();

    newRound();

});



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



    document.getElementById("glyph").innerHTML =
    currentGlyph.glyph;



    let answers =
    [currentGlyph.script];



    while(answers.length < 4){

        let random =
        glyphs[Math.floor(Math.random()*glyphs.length)].script;


        if(!answers.includes(random)){
            answers.push(random);
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


if(selectedAnswer === currentGlyph.script){


    score++;


    document.getElementById("result").innerHTML =
    "✅ Correct" + info;


} else {


    document.getElementById("result").innerHTML =
    "❌ Wrong. It was " 
    + currentGlyph.script 
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

document.getElementById("restartButton").style.display = "inline";

}

function restartGame(){

document.querySelector("h2").style.display = "block";

    score = 0;
    total = 0;


    remainingGlyphs = [...glyphs];


    updateScore();

document.getElementById("result").innerHTML = "";


    document.getElementById("lock").style.display = "inline";

    document.getElementById("nextButton").style.display = "inline";

    document.getElementById("restartButton").style.display = "none";


    newRound();


}