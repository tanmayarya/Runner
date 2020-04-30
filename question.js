var marked = -1;
var interv;
var question = "";
var options =[];
var ans;
var gameScene;
var seconds = 15;
var countdown;

function submitClick(){
    marked = $("input[name='inlineRadioOptions']:checked").val();
    if(marked > -1){
        clearTimeout(interv);
        hideQuestion();
    }
}
function cancelClick(){
    marked = -1;
    clearTimeout(interv);
    hideQuestion();
}

function PlayAgain(){
    $('#gameOverModal').modal('hide');
    gameScene.scene.start("PlayGame");
}

function getRandom(min, max){
    min = Math.ceil(min); 
    max = Math.floor(max); 
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
function genQuestion(){
    var numbers = [getRandom(1,9), getRandom(1,9), getRandom(1,9), getRandom(1,9)];
    var operators = ['+', '-'];
    question = (numbers[0] + " " + operators[getRandom(0,1)] + " " + numbers[1] + " " + operators[getRandom(0,1)] + " " + numbers[2] + " " + operators[getRandom(0,1)] + " " + numbers[3]) ;
    ans = eval(question);
    options = [ans]
    while(options.length < 4){
        var r = getRandom(0,37);
        if(options.indexOf(r) === -1) options.push(r);
    }

    options = shuffle(options);
}


function displayQuestion() {

    $('#myModalLabel').text("Question: " + question);
    $('#label0').text(options[0]);
    $('#label1').text(options[1]);
    $('#label2').text(options[2]);
    $('#label3').text(options[3]);

    $('#myModal').modal('show');
    seconds = 15;
    var el = document.getElementById("countdown");
    el.textContent = seconds;
    countdown = setInterval(function() {
        seconds--;
        el.textContent = seconds;
        if (seconds <= 0) clearInterval(countdown);
    }, 1000);
    
   
}

// function hideQuestion(){
//     $('#myModal').modal('hide');
// }

function mm(game){
    gameScene = game;
    genQuestion();   
    displayQuestion()
    interv = setTimeout(function(){
        hideQuestion();
    },15000);
}

function hideQuestion(){
    $('#myModal').modal('hide');
    clearInterval(countdown);
    seconds = 15;
    
    $('input[name=inlineRadioOptions]').attr('checked',false);
    var ans = eval(question);
    var val = 0;
    if(options[marked] === ans){
        val = 5;
    }
    else{
        val = -1;
    }
    gameScene.updateScore(val);
    showAlert(val == 5);
   
    setTimeout(function(){
        gameScene.scene.resume();
    },3000);
    

}

function showAlert(correct) {
    let className;
    let message;

    if(correct) {
        className = "alert alert-success collapse";
        message = "Correct Answer, you earned 5 coins."
    } else if(marked<0) {
        className = "alert alert-warning collapse";
        message = "Missed it, you lost a coin."
    } else{
        className = "alert alert-danger collapse";
        message = "Wrong Answer, you lost a coin."
    }

    $("#myAlert").attr("class",className);
    $("#myAlert").text(message);
    $('#myAlert').show('fade');

    setTimeout(function(){
        $('#myAlert').hide('fade');
    },2000);

}

function displayResult(coinsCollected, timeElapsed,game){
    gameScene = game;
    gameScene.scene.pause();
    $('#gameOverModal').modal('show');
    $('#survivalTime').text(timeElapsed);
    $('#coinsCollected').text(coinsCollected);
}
