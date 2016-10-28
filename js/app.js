document.addEventListener("DOMContentLoaded", function() {
    //finding elements in DOM
    var container = document.getElementById("container");
    var gameArea = document.querySelector(".gameArea");
    var timeBox = gameArea.querySelector("#timeBox");
    var scoreBox = gameArea.querySelector("#scoreBox");
    var shotsBox = gameArea.querySelector("#shotsBox");
    var accuracyBox = gameArea.querySelector("#accuracyBox");
    var infoBox = container.querySelector("#infoBox");
    var volumeBox = infoBox.querySelector("#volumeBox");
    var username = infoBox.querySelector("#username");
    var scenery = infoBox.querySelector("#scenery");
    var creditsBox = infoBox.querySelector("#creditsBox");
    var closeCredits = creditsBox.querySelector("#closeCredits");
    var scoreboardBox = infoBox.querySelector("#scoreboardBox");
    var closeScores = scoreboardBox.querySelector("#closeScores");
    var scoreboardlist = scoreboardBox.querySelector("#scoreboardlist");
    var startGame = infoBox.querySelector(".start");
    //all music elements
    var soundShot = new Audio("./sounds/gun1.mp3");
    var soundYahoo = new Audio("./sounds/yahoo.mp3");
    var soundPlay = new Audio("./sounds/play.mp3");
    var soundOver = new Audio("./sounds/gameover.mp3");
    var soundFlamingo = new Audio("./sounds/flamingo.mp3");
    var wrong = new Audio("./sounds/wrong.mp3");
    var backMusic = new Audio("./sounds/backMusic.mp3");;
    // all animals
    var duck1 = "./images/duck1.gif";
    var duck2 = "./images/duck2.gif";
    var flamingo = "./images/flamingo1.gif";
    var horse = container.querySelector("#horse");
    var sheep = container.querySelector("#sheep");
    //variables for functions
    var hits = 0;
    var shots = 0;
    var random;
    var data = [];
    var usernameValue;
    var allBirds;
    var superBird = 0; // neccessary to accuracy calculations
    var isSoundOn = true; // play sound - default


    // create new birds - in choosen locations
    function createBird(birdName, fromClass, toClass) {
        random = Math.floor(Math.random() * (toClass - fromClass + 1) + fromClass);
        var newBird = document.createElement("img"); // creating new bird
        newBird.setAttribute("src", birdName);
        newBird.classList.add("fly"); // important for good click calculations later
        newBird.classList.add("bird" + random);
        container.appendChild(newBird); //adding element to DOM
    }

    // manipulate game time and actions in specific time
    function gameTimer(secs) {
        if (secs < 1) { // after counting -> game is over
            timeBox.innerHTML = 'GAME OVER';
            playSound(soundOver);
            gameArea.removeEventListener("click", play); // cannot click on birds and play
            shotsBox.innerHTML = "Shots: " + shots;
            if (shots > 0) { // because shots is divider
                accuracyBox.innerHTML = "Accuracy: " + (((hits - superBird) / shots) * 100).toFixed(2) + "%"; // 0.00 format
            } else {
                accuracyBox.innerHTML = "Accuracy: 0%";
            }

            allBirds = container.querySelectorAll("img.fly"); //all birds on board
            var allBirdslength = allBirds.length;
            for (var i = 0; i < allBirdslength; i++) { // delete all birds after each game
                allBirds[i].parentNode.removeChild(allBirds[i]);
            }
            infoBox.style.visibility = 'visible'; // show infobox after game
            // saving and loading (after game) results using firebase
            firebase
                .database()
                .ref('scores')
                .once('value', function(snapshot) {
                    data = snapshot.val() || [];
                    data.push({ // add our username and hits to data array
                        'username': usernameValue,
                        'hits': hits
                    });
                    firebase
                        .database()
                        .ref('scores')
                        .set(data);

                    function compare(a, b) { // sorting array by hits
                        if (a.hits < b.hits)
                            return 1;
                        if (a.hits > b.hits)
                            return -1;
                        return 0;
                    }

                    data.sort(compare);
                    scoreboardlist.innerHTML = ""; // avoit double values after innerhtml
                    for (var i = 0; i < 10; i++) {
                        scoreboardlist.innerHTML += "<li>" + data[i].username + " - " + data[i].hits + "</li>";
                    }
                });
            return;
        } else {
            gameArea.addEventListener("click", play); // let's play game when counter is on
            timeBox.innerHTML = secs; // inner timer
            infoBox.style.visibility = 'hidden';
            if (secs <= 5) { // 5 secs left - red timer
                timeBox.innerHTML = "<span class='countTime'>" + secs + "</span>";
            }

        };
        if (secs % 2 == 0) { // create different ducks in intervals
            createBird(duck1, 1, 2);
            createBird(duck2, 3, 4);
        }
        if (secs % 4 == 0) {
            createBird(duck2, 6, 5);
        }
        if (secs == 7) {
            createBird(flamingo, 9, 7);
        }

        secs--;
        setTimeout(function() {
            gameTimer(secs);
        }, 1000); // one second
    }

    //enable or disable single sound
    function playSound(soundName, loop) { // loop - because we want to loop one of few sounds
        if (isSoundOn) {
            if (loop) {
                (soundName).addEventListener('ended', function() { // make sound looped
                    this.currentTime = 0;
                    this.play();
                }, false);
                (soundName).play();
            } else {
                (soundName).play();
            }
        }
    }
    // sound on or sound off after click
    function volumeOn() {
        volumeBox.addEventListener("click", function() {
            volumeBox.classList.toggle("volumeOff");
            if (volumeBox.classList.contains("volumeOff")) {
                isSoundOn = false;
                volumeBox.innerHTML = "SOUND OFF";
                backMusic.muted = true;
            } else {
                isSoundOn = true;
                volumeBox.innerHTML = "SOUND ON";
                backMusic.muted = false;
            };
        });


    }
    // change scenery - day or night
    function changeScenery() {
        scenery.addEventListener("click", function() { // after click on scenery button
            gameArea.classList.toggle("backSwitch");
            if (gameArea.classList.contains("backSwitch")) { // night
                duck1 = "./images/duck1bright.gif";
                duck2 = "./images/duck2bright.gif";
                flamingo = "./images/flamingo1bright.gif";
                horse.setAttribute("src", "./images/horsebright.gif");
                sheep.setAttribute("src", "./images/sheepbright.gif");
            } else { //day
                duck1 = "./images/duck1.gif";
                duck2 = "./images/duck2.gif";
                flamingo = "./images/flamingo1.gif";
                horse.setAttribute("src", "./images/horse.gif");
                sheep.setAttribute("src", "./images/sheep.gif");
            }
        });
    }
    // each game
    function play(event) {
        shots++; // 1 click = 1 shot
        playSound(soundShot);
        // hit in horse or sheep
        var horseBounding = horse.getBoundingClientRect();
        var sheepBounding = sheep.getBoundingClientRect();
        if ((event.clientX >= horseBounding.left && event.clientX <= horseBounding.right) && (event.clientY >= horseBounding.top && event.clientY <= horseBounding.bottom) ||
            (event.clientX >= sheepBounding.left && event.clientX <= sheepBounding.right) && (event.clientY >= sheepBounding.top && event.clientY <= sheepBounding.bottom)) {
            hits--; // minus one point
            playSound(wrong);
            scoreBox.innerHTML = "Score: " + "<span class='minusPoint'>" + hits + "</span>";
        };
        // hit in birds
        allBirds = this.querySelectorAll("img.fly");
        var allBirdslength = allBirds.length;
        for (var i = 0; i < allBirdslength; i++) {
            var birdBounding = allBirds[i].getBoundingClientRect();
            if ((event.clientX >= birdBounding.left && event.clientX <= birdBounding.right) && (event.clientY >= birdBounding.top && event.clientY <= birdBounding.bottom)) {
                hits++;
                scoreBox.innerHTML = "Score: " + "<span class='newPoint'>" + hits + "</span>";
                allBirds[i].parentNode.removeChild(allBirds[i]); // delete shooted bird
                playSound(soundYahoo);
                // flamingo - super bird +5 points
                if (allBirds[i].classList.contains('bird7') || allBirds[i].classList.contains('bird8') || allBirds[i].classList.contains('bird9')) {
                    playSound(soundFlamingo);
                    hits = hits + 5;
                    scoreBox.innerHTML = "Score: " + "<span class='bigPoint'>" + hits + "</span>";
                    superBird = 5;
                }
            }
        };
    };
    // initialize game!
    function init() {
        volumeOn();
        changeScenery()
            // only loading data from database
        firebase
            .database()
            .ref('scores')
            .on('value', function(snapshot) {
                data = snapshot.val();

                function compare(a, b) {
                    if (a.hits < b.hits)
                        return 1;
                    if (a.hits > b.hits)
                        return -1;
                    return 0;
                }
                data.sort(compare);
                scoreboardlist.innerHTML = "";
                for (var i = 0; i < 10; i++) {
                    scoreboardlist.innerHTML += "<li>" + data[i].username + " - " + data[i].hits + "</li>";
                }
            });
        playSound(backMusic, true);

        startGame.addEventListener("click", function() { // start game
            usernameValue = username.value;
            playSound(soundPlay);
            hits = 0; //reset hits counter after game
            shots = -1; // reset shots after game -1 - because we have one click on start button
            scoreBox.innerHTML = "Score: " + hits;
            shotsBox.innerHTML = "";
            accuracyBox.innerHTML = "";
            gameArea.addEventListener("click", play); // loading our play function
            gameTimer(40); //specify game time
        });
    };
    init();
});
//show credits after click
function showCredits() {
    creditsBox.classList.toggle("showBox");
    closeCredits.addEventListener("click", function() {
        creditsBox.classList.remove("showBox");
    });
}
//show scores after click
function showScores() {
    scoreboardBox.classList.toggle("showBox");
    closeScores.addEventListener("click", function() {
        scoreboardBox.classList.remove("showBox");
    });
}
