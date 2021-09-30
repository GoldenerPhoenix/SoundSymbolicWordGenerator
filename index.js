var mousePressed = false;
var lastX, lastY;
var ctx;

//Function used to initialize the canvas and drawing part:
function InitThis() {
    ctx = document.getElementById('myCanvas').getContext("2d");

    //make background of canvas white
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //make background of canvas white end

    $('#myCanvas').mousedown(function (e) {
        mousePressed = true;
        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
    });

    $('#myCanvas').mousemove(function (e) {
        if (mousePressed) {
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
    });

    $('#myCanvas').mouseup(function (e) {
        mousePressed = false;
    });
	    $('#myCanvas').mouseleave(function (e) {
        mousePressed = false;
    });
}

//Function used to draw on the canvas
function Draw(x, y, isDown) {
    if (isDown) {
        ctx.beginPath();
        ctx.strokeStyle = $('#selColor').val();
        ctx.lineWidth = $('#selWidth').val();
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x; lastY = y;
    const cb = document.getElementById('LivePredictionCheckbox'); //Check if Live-Generation is desired.
    if (cb.checked){
        make_prediction(); //Execute the Prediction while drawing (Live-Generation)
    }
}


//Function used to clear the canvas:
function clearArea() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";  //Overwrite the current canvas with white color so the network won't get a "transparent" image.
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


//Function used to load the models:
async function loadModel() {
	model = undefined;
	//model = await tf.loadLayersModel('EdgySMJSTest0607/model.json');
  //model = await tf.loadLayersModel('EdgySMJSTest1608/model.json');
  model = await tf.loadLayersModel('EdgySMJSTest3008/model.json');
  modelComplexity = undefined;
  modelComplexity = await tf.loadLayersModel('Complexity3108/model.json');
	console.log("model loaded");
  $(".loader-wrapper").fadeOut("slow");
}

loadModel(); //Execute the model load function


//Function used to predict the shape properties from an uploaded image file:

async function make_prediction_from_image() {
  img_array = cv.imread(document.getElementById('edgyneu1'), cv.IMREAD_GRAYSCALE);
  cv.cvtColor(img_array, img_array, cv.COLOR_RGBA2GRAY);

  //"Predict" size of shape and store it in the variable SizeOfShape:
  SizeOfShape = await determinesize(await img_array.data);

  let dsize = new cv.Size(100, 100);
  cv.resize(img_array, img_array, dsize);
  tensor = tf.tensor(img_array.data, [1, img_array.rows, img_array.cols, 1]).div(255);


  const ausputt3 = model.predict(tensor);
  const complexityausputt3 = modelComplexity.predict(tensor);
  console.log(ausputt3);
  //const auspuff = Array.from(ausputt.argMax(1).dataSync());
  const auspuff3 = Array.from(ausputt3.dataSync());
  const complexityauspuff3 = Array.from(complexityausputt3.dataSync());


  //Create Pools for Sounds:

  PoolConsonants = {}
  PoolConsonants['Voiceless'] = {}
  PoolConsonants['Voiceless']['Plosives'] = ['p','t','k']
  PoolConsonants['Voiced'] = {}
  PoolConsonants['Voiced']['Nasals'] = ['m', 'n']
  PoolConsonants['Voiced']['Liquids'] = ['l']

  PoolVowelsSize = {}
  PoolVowelsSize['big'] = ['a', 'o', 'u']
  PoolVowelsSize['small'] = ['i', 'ü']

  PoolVowelsColour = {}
  PoolVowelsColour['yellow'] = ['i']
  PoolVowelsColour['green'] = ['ü', 'u']
  PoolVowelsColour['#3e8abe'] = ['ü', 'o'] //blue
  PoolVowelsColour['red'] = ['a']


  var LowerBoundary = 0;
  var UpperBoundary = 100;


  ColourOfShape = $('#selColor').val(); //Retrieve information about selected colour

  //Print the created word on the html-element:
  document.getElementById("nametag").innerHTML = await createWord(auspuff3, complexityauspuff3, SizeOfShape, ColourOfShape); //prints on Nametag-Element

  }


//Function used to predict the shape properties from the canvas:
async function make_prediction() {
  //Read the image from the canvas and convert it to grayscale:
  img_array_fromCanvas = cv.imread(document.getElementById('myCanvas'), cv.IMREAD_GRAYSCALE);
  cv.cvtColor(img_array_fromCanvas, img_array_fromCanvas, cv.COLOR_RGBA2GRAY);

  //"Predict" size of shape and store it in the variable SizeOfShape:
  SizeOfShape = await determinesize(await img_array_fromCanvas.data);

  let dsize = new cv.Size(100, 100);  //Resize the image
  cv.resize(img_array_fromCanvas, img_array_fromCanvas, dsize);
  tensor_fromCanvas = tf.tensor(img_array_fromCanvas.data, [1, img_array_fromCanvas.rows, img_array_fromCanvas.cols, 1]).div(255); //Convert it to a tensor and normalize the pixel values (div(255=))

  //Convert the prediction output to a readable form:
  const ausputt4 = model.predict(tensor_fromCanvas);
  const complexityausputt4 = modelComplexity.predict(tensor_fromCanvas);
  //const auspuff = Array.from(ausputt.argMax(1).dataSync());
  const auspuff4 = Array.from(ausputt4.dataSync());
  const complexityauspuff4 = Array.from(complexityausputt4.dataSync());


  
  PoolVowelsSize['big'] = ['a', 'o', 'u']
  PoolVowelsSize['small'] = ['i', 'ü']

  PoolVowelsColour = {}
  PoolVowelsColour['yellow'] = ['i']
  PoolVowelsColour['green'] = ['ü', 'u']
  PoolVowelsColour['#3e8abe'] = ['ü', 'o'] //blue
  PoolVowelsColour['red'] = ['a']


  var LowerBoundary = 0;
  var UpperBoundary = 100;

  ColourOfShape = $('#selColor').val(); //Retrieve information about selected colour

  //Print the created word on the html-element:
  document.getElementById("nametag").innerHTML = await createWord(auspuff4, complexityauspuff4, SizeOfShape, ColourOfShape); //prints on Nametag-Element

  }


//Function used to create the word
async function createWord(predictionEdgyRound, predictionComplexity, SizeOfShape, Colour) { //Takes the shape properties as input
  //Initialize word variables
  var Word = '';
  var WordLengthLowerBoundary = 0;
  var WordLengthUpperBoundary = 0;

  //COMPLEXITY
  //Set the possible word lengths with respect to the complexity property of the shape:
  if (predictionComplexity[0] > predictionComplexity[1] & predictionComplexity[0] > predictionComplexity[2]){
    WordLengthLowerBoundary = 2;
    WordLengthUpperBoundary = 4;
  }
  else if (predictionComplexity[1] > predictionComplexity[0] & predictionComplexity[1] > predictionComplexity[2]){
    WordLengthLowerBoundary = 4;
    WordLengthUpperBoundary = 8;
  }
  else{
    WordLengthLowerBoundary = 8;
    WordLengthUpperBoundary = 12;
  }

  var WordLength = Math.floor(Math.random() * (WordLengthUpperBoundary - WordLengthLowerBoundary +1)) + WordLengthLowerBoundary; //Generate random word length within the boundaries

  //EDGY VS ROUND
  //Set the boundaries for the random picking of the consonants with respect to the edgy/round property of the shape:

  if (predictionEdgyRound[0] >= 0.5){
    LowerBoundary = 0;
    UpperBoundary = 55;
  }
  else{
    LowerBoundary = 45;
    UpperBoundary = 100;
  }


  //SIZE
  //Set the boundaries for the random picking of the vowels with respect to the size property of the shape:
  if (SizeOfShape < 0.3) {
    LowerBoundaryVowel = 0;
    UpperBoundaryVowel = 50;
  }
  else if (SizeOfShape < 0.4) {
    LowerBoundaryVowel = 0;
    UpperBoundaryVowel = 55;
  }
  else if (SizeOfShape < 0.5) {
    LowerBoundaryVowel = 0;
    UpperBoundaryVowel = 100;
  }
  else if (SizeOfShape < 0.6) {
    LowerBoundaryVowel = 0;
    UpperBoundaryVowel = 100;
  }
  else if(SizeOfShape < 0.7) {
    LowerBoundaryVowel = 45;
    UpperBoundaryVowel = 100;
  }
  else{
    LowerBoundaryVowel = 50;
    UpperBoundaryVowel = 100;
  }
  

  if (i % 2 == 0){
    Word = Word + await pickConsonant(LowerBoundary, UpperBoundary, WordLength);
  } 
  else{
    Word = Word + await  pickVowel(LowerBoundaryVowel,UpperBoundaryVowel, Colour, WordLength);
  }


return(await Word); //return the complete word

}

//Function used to pick a consonant according to the shape properties
async function pickConsonant(LowerBoundary, UpperBoundary, WordLength) {  //Takes the Lower and UpperBoundary for the randomizer as input + WordLength to not allow "variation" in short words 
  if (WordLength <= 6){

    if (UpperBoundary == 55){
      UpperBoundary = 49
      LowerBoundary = 0
    }
    else{
      UpperBoundary = 100
      LowerBoundary = 50
    }

  }
  var RandomConsonant = Math.floor(Math.random() * (UpperBoundary - LowerBoundary +1)) + LowerBoundary; //Generates a random number within the specified boundaries
  if (RandomConsonant >= 50){                                                                           //Depending on the random number, a different kind of consonant gets picked
    var RandomClass = Math.floor(Math.random() * (2 - 1 +1)) + 1;
    if (RandomClass == 1){
      var Consonant = PoolConsonants['Voiced']['Liquids'][0];
    }
    else{
      var Consonant = PoolConsonants['Voiced']['Nasals'][Math.floor(Math.random() * (1 - 0 +1)) + 0];
    }
  }
  else if (RandomConsonant < 50){
    var Consonant = PoolConsonants['Voiceless']['Plosives'][Math.floor(Math.random() * (2 - 0 +1)) + 0];
  }

  return(await Consonant);  //return the chosen consonant
}

//Function used to pick a vowel according to the shape properties
async function pickVowel(LowerBoundary, UpperBoundary, Colour, WordLength){ //Takes the Lower and UpperBoundary for the randomizer as input
  
  if (WordLength <= 6){ //If the word length is lower or equal to six, do not allow other vowels than the ones conveying the intended association

    if (UpperBoundary <= 55){
      UpperBoundary = 49
      LowerBoundary = 0
    }
    else if (LowerBoundary >= 45){
      UpperBoundary = 100
      LowerBoundary = 51
    }
  }

  var RandomVowel = Math.floor(Math.random() * (UpperBoundary - LowerBoundary +1)) + LowerBoundary; //Generates a random number within the specified boundaries
  if (WordLength > 6){
    ColourOutrule = Math.floor(Math.random() * (100 - 0 +1)) + 0; //random variable to give a slight chance for the colour to overrule the size
  }
  else{
    ColourOutrule = 100;
  }

  if (RandomVowel <= 50){  //Depending on the random number, a different kind of vowel gets picked, if smaller than 50, attempt to pick small vowel
    var MatchingVowels = [];  //List to store matching vowels between Size and Colour of shape 
    for (const ColourVowel in PoolVowelsColour[Colour]){//iterate through all fitting ColourVowels
      if (PoolVowelsSize['small'].includes(PoolVowelsColour[Colour][ColourVowel])){ 
        MatchingVowels.push(PoolVowelsColour[Colour][ColourVowel]);
      } 
    }
    if (MatchingVowels.length > 0){ //if there were any fitting vowels
      var Vowel = MatchingVowels[Math.floor(Math.random() * ((MatchingVowels.length-1) - 0 +1)) + 0]; //if everything matches, pick one random vowel that matches
    }
    else if (ColourOutrule <=5){ //Else if there were not any fitting vowels, check if colour overrules Size (5% Chance)
      Vowel = PoolVowelsColour[Colour][Math.floor(Math.random() * ((Object.keys(PoolVowelsColour[Colour]).length-1) - 0 +1)) + 0]; //Pick one of the ColourVowels available
    }
    else{//Else if colour doesnt overrule Size and there was no matching vowel, pick an available SizeVowel
      Vowel = PoolVowelsSize['small'][Math.floor(Math.random() * ((PoolVowelsSize['small'].length-1) - 0 +1)) + 0];
    }                                                                       
  }
  else if (RandomVowel >= 50){  //if value is higher than 50, a big vowel is attempted to be picked
    var MatchingVowels = [];
    for (const ColourVowel in PoolVowelsColour[Colour]){ //iterate through all fitting ColourVowels
      if (PoolVowelsSize['big'].includes(PoolVowelsColour[Colour][ColourVowel])){
        MatchingVowels.push(PoolVowelsColour[Colour][ColourVowel]); //if a colour vowel fits to the size decision, put it on the matching list 
      } 
    }
    if (MatchingVowels.length > 0){ //if there were any fitting vowels
      var Vowel = MatchingVowels[Math.floor(Math.random() * ((MatchingVowels.length-1) - 0 +1)) + 0]; //if everything matches, pick one random vowel that matches
    }
    else if (ColourOutrule <=5){ //Else if there were not any fitting vowels, check if colour outrules Size (5% Chance)
      Vowel = PoolVowelsColour[Colour][Math.floor(Math.random() * ((Object.keys(PoolVowelsColour[Colour]).length-1) - 0 +1)) + 0]; //Pick one of the ColourVowels available
    }
    else{//Else if colour doesnt overrule Size and there was no matching vowel, pick an available SizeVowel
      Vowel = PoolVowelsSize['big'][Math.floor(Math.random() * ((PoolVowelsSize['big'].length-1) - 0 +1)) + 0];
    } 
  }

  return(await Vowel);  //return the chosen vowel
}

//Function used to determine the size of the drawing:
async function determinesize(img_array) { //Takes the image array with pixel values as input
  //Initialize the important values to be at their "weakest" value.
  highestpixel = 999999999;
  lowestpixel = 0;
  leftmostpixel = 99999999;
  rightmostpixel = 0;
  row = 1
  column = 0
  for (var i = 0; i < img_array.length; i++) {  //Iterate through the array
    column++; //Count up the column
    if(i % 512 == 0) {  //If the end of a row is reached, reset the column and increment the row
      row++;
      column = 1;
    }
    if (img_array[i] != 255) {  //If the pixel value is not 255 (= not white), check if the current pixel position is more extrem than the current max
      if (row < highestpixel) {
        highestpixel = row;
      }
      if (row > lowestpixel) {
        lowestpixel = row;
      }
      if (column < leftmostpixel) {
        leftmostpixel = column;
      }
      if (column > rightmostpixel) {
        rightmostpixel = column;
      }
    }
  }
  height = lowestpixel - highestpixel;      //calculate height
  width = rightmostpixel - leftmostpixel;   //calculate width
  size = (height / 383 + width / 511) / 2 //normalize the size value according to the dimensions of the canvas 
  //console.log(size); //Nur zum Debuggen
  return (size);  //return the size value of the shape
  // 0: tiniest possible; 1: largest possible
}

