var currentMood: Mood;

var pageheader = $("#page-header")[0];
var pagecontainer = $("#page-container")[0]; 
var imgSelector : HTMLInputElement = <HTMLInputElement> $("#my-file-selector")[0]; 


imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Analysing...";
    $("#sentenceDisplay")[0].innerHTML = " ";
    processImage(function (file) {
        sendEmotionRequest(file, function (emotionScores) {
            currentMood = getCurrMood(emotionScores);
            changeUI();
        });
    });
});

function processImage(callback) : void {
    var file = imgSelector.files[0];
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file);
    } else {
        console.log("Invalid file");
    }
    reader.onloadend = function () { 
        if (!file.name.match(/\.(jpg|jpeg|png|JPG)$/)){
            pageheader.innerHTML = "Please upload an image file (jpg, jpeg or png).";
        } else {
            callback(file);
        }
    }
}

function changeUI() : void {
    pageheader.innerHTML = "We have analysed your photo and to us you look " + currentMood.name + "!";
    loadSentence(currentMood);
}

function sendEmotionRequest(file, callback) : void {
    $.ajax({
        url: "https://api.projectoxford.ai/emotion/v1.0/recognize",
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "1cd7d2b2ea6d4410a7a751076463f911");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
            if (data.length != 0) {
                var scores = data[0].scores;
                callback(scores);
            } else {
                sweetAlert("You sure there's a face in there?");
                pageheader.innerHTML = "We can't detect a human face in that photo. Try another?";
            }
        })
        .fail(function (error) {
            sweetAlert("Error!");
            pageheader.innerHTML = "Sorry, something went wrong. :( Try again in a bit?";
            console.log(error.getAllResponseHeaders());
        });
}


class Mood {
    name: string;
    emoji: string;
    constructor(public mood, public emojiurl) {
        this.name = mood;
        this.emoji = emojiurl;
    }
}


var happy : Mood = new Mood("happy", "http://emojipedia-us.s3.amazonaws.com/cache/a0/38/a038e6d3f342253c5ea3c057fe37b41f.png");
var sad : Mood  = new Mood("sad", "https://cdn.shopify.com/s/files/1/1061/1924/files/Sad_Face_Emoji.png?9898922749706957214");
var angry : Mood = new Mood("angry", "https://cdn.shopify.com/s/files/1/1061/1924/files/Very_Angry_Emoji.png?9898922749706957214");
var neutral : Mood  = new Mood("neutral", "https://cdn.shopify.com/s/files/1/1061/1924/files/Neutral_Face_Emoji.png?9898922749706957214");

function getCurrMood(scores : any) : Mood {
    if (scores.happiness > 0.4) {
        currentMood = happy;
    } else if (scores.sadness > 0.4) {
        currentMood = sad;
    } else if (scores.anger > 0.4) {
        currentMood = angry;
    } else {
        currentMood = neutral;
    }
    return currentMood;
}

class Encouragements {
    happy: string[];
    sad: string[];
    angry: string[];
    neutral: string[];

    constructor() {
        this.happy = [];
        this.sad = [];
        this.angry = [];
        this.neutral = [];
    }

    addSentence(mood : string, sentence : string) : void {
        if (mood === "happy") {
            this.happy.push(sentence);
        } else if (mood === "sad") {
            this.sad.push(sentence);
        } else if (mood === "angry") {
            this.angry.push(sentence);
        } else if (mood === "neutral") {
            this.neutral.push(sentence);
        } // do a default one as well
    }

    getRandSentence(mood : string) : string {
        if (mood === "happy") {
            return this.happy[Math.floor(Math.random() * this.happy.length)];
        } else if (mood === "sad") {
            return this.sad[Math.floor(Math.random() * this.sad.length)];
        } else if (mood === "angry") {
            return this.angry[Math.floor(Math.random() * this.angry.length)];
        } else if (mood === "neutral") {
            return this.neutral[Math.floor(Math.random() * this.neutral.length)];
        } 
    }
}

var myEncouragements : Encouragements;

function init() : void {
    myEncouragements = new Encouragements();
    myEncouragements.addSentence("happy", "That's great! Looks like you didn't even need to visit this website! ;)");
    myEncouragements.addSentence("happy", "Cool! Hope the rest of your day goes just as well :)");
    myEncouragements.addSentence("happy", "Good on ya! Now go ahead and have a great day! :)");
    myEncouragements.addSentence("sad", "That's shame :/ Hope the rest of your day goes better!");
    myEncouragements.addSentence("sad", "Either that or maybe you just have a sad resting face? ;)");
    myEncouragements.addSentence("sad", "Oh dear! Maybe you should go watch a comedy movie today? :)");
    myEncouragements.addSentence("angry", "What made you so angry? Try to calm down and you'll feel better!");
    myEncouragements.addSentence("angry", "Chill out bro!");
    myEncouragements.addSentence("angry", "Looks like you need to cool down! Go for a swim maybe?");
    myEncouragements.addSentence("neutral", "Looks like you're feeling a little 'meh'. Try to stay positive though! :)");
    myEncouragements.addSentence("neutral", "Tired maybe? Go have some coffee! ;)");
}

function loadSentence(currentMood : Mood) : void {
    var sentenceSelected : string = myEncouragements.getRandSentence(currentMood.name);
    $("#sentenceDisplay")[0].innerHTML = sentenceSelected;
}

init();