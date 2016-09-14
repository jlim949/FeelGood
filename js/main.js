var currentMood;
var pageheader = $("#page-header")[0];
var pagecontainer = $("#page-container")[0];
var imgSelector = $("#my-file-selector")[0];
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
function processImage(callback) {
    var file = imgSelector.files[0];
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file);
    }
    else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        if (!file.name.match(/\.(jpg|jpeg|png|JPG)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg, jpeg or png).";
        }
        else {
            callback(file);
        }
    };
}
function changeUI() {
    pageheader.innerHTML = "We have analysed your photo and to us you look " + currentMood.name + "!";
    loadSentence(currentMood);
}
function sendEmotionRequest(file, callback) {
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
        }
        else {
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
var Mood = (function () {
    function Mood(mood, emojiurl) {
        this.mood = mood;
        this.emojiurl = emojiurl;
        this.name = mood;
        this.emoji = emojiurl;
    }
    return Mood;
}());
var happy = new Mood("happy", "http://emojipedia-us.s3.amazonaws.com/cache/a0/38/a038e6d3f342253c5ea3c057fe37b41f.png");
var sad = new Mood("sad", "https://cdn.shopify.com/s/files/1/1061/1924/files/Sad_Face_Emoji.png?9898922749706957214");
var angry = new Mood("angry", "https://cdn.shopify.com/s/files/1/1061/1924/files/Very_Angry_Emoji.png?9898922749706957214");
var neutral = new Mood("neutral", "https://cdn.shopify.com/s/files/1/1061/1924/files/Neutral_Face_Emoji.png?9898922749706957214");
function getCurrMood(scores) {
    if (scores.happiness > 0.4) {
        currentMood = happy;
    }
    else if (scores.sadness > 0.4) {
        currentMood = sad;
    }
    else if (scores.anger > 0.4) {
        currentMood = angry;
    }
    else {
        currentMood = neutral;
    }
    return currentMood;
}
var Encouragements = (function () {
    function Encouragements() {
        this.happy = [];
        this.sad = [];
        this.angry = [];
        this.neutral = [];
    }
    Encouragements.prototype.addSentence = function (mood, sentence) {
        if (mood === "happy") {
            this.happy.push(sentence);
        }
        else if (mood === "sad") {
            this.sad.push(sentence);
        }
        else if (mood === "angry") {
            this.angry.push(sentence);
        }
        else if (mood === "neutral") {
            this.neutral.push(sentence);
        } // do a default one as well
    };
    Encouragements.prototype.getRandSentence = function (mood) {
        if (mood === "happy") {
            return this.happy[Math.floor(Math.random() * this.happy.length)];
        }
        else if (mood === "sad") {
            return this.sad[Math.floor(Math.random() * this.sad.length)];
        }
        else if (mood === "angry") {
            return this.angry[Math.floor(Math.random() * this.angry.length)];
        }
        else if (mood === "neutral") {
            return this.neutral[Math.floor(Math.random() * this.neutral.length)];
        }
    };
    return Encouragements;
}());
var myEncouragements;
function init() {
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
function loadSentence(currentMood) {
    var sentenceSelected = myEncouragements.getRandSentence(currentMood.name);
    $("#sentenceDisplay")[0].innerHTML = sentenceSelected;
}
init();
