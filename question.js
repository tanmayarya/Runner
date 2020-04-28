
function getRandom(min, max){
    min = Math.ceil(min); 
    max = Math.floor(max); 
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genQuestion(){
    var numbers = [getRandom(1,9), getRandom(1,9), getRandom(1,9), getRandom(1,9)];
    var operators = ['+', '-'];

    return (numbers[0] + " " + operators[getRandom(0,1)] + " " + numbers[1] + " " + operators[getRandom(0,1)] + " " + numbers[2] + " " + operators[getRandom(0,1)] + " " + numbers[3]) ;
}


function displayQuestion(question, options) {

}

function mm(){


    var question = genQuestion();

    var options = [eval(question)]
    while(options.length < 4){
        var r = getRandom(0,100);
        if(options.indexOf(r) === -1) options.push(r);
    }

    var response = displayQuestion(question, options)

    return response == eval(question);
}