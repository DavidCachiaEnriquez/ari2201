  const URL = "https://teachablemachine.withgoogle.com/models/ua5xBQ-wN/";

let model, webcam, labelContainer, maxPredictions;

var w=500, h=600, ballSize=10, brickW=30, brickH=20, padW=100, padH=20
var numOfBricks = 0, clickFlag = 0
var ballX, ballY, dx, dy, bricks=[], padX=w/2, padY=h-50
var c = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
c.width = w; c.height = h
var colours = []

async function hideButton() {
  document.getElementById("titleScreen").hidden = true
  document.getElementById("webcam-container").hidden = false
  clickFlag = 1
  runGame()
}

async function runGame(){
  init()
  setInterval(game, 5)
}

async function init() {
  document.getElementById("wrapper").hidden = false
  bricks=[], ballX=w/2, ballY=h-100, dx=(Math.random()*0.5) + 0.25, dy=-1
  colourPicks = ["#ff0000", "#ff7700", "#ffd900", "#59ff00", "#00eeff", "#5100ff", "#ff00e1"]

  for (var y = 0; y < 7; y++) {
    for (var x = 0; x < 13; x++) {
      bricks.push({x: 50+x*brickW, y: 50+y*brickH, active: true})
      colours.push(colourPicks[y])
    }
  }
  numOfBricks = bricks.length
}

async function game() {
  move()
  draw()
}

async function move() {
  if (ballX-ballSize+dx < 0) dx = -dx
  if (ballX+ballSize+dx > w) dx = -dx
  if (ballY-ballSize+dy < 0) dy = -dy
  if (ballY-ballSize> padY) return false
  if (ballY+ballSize > padY && ballX+ballSize > padX-padW/2 && ballX-ballSize < padX+padW/2) dy = -dy

  ballX += dx
  ballY += dy

  for (var i = 0; i < bricks.length; i++) {
    var b = bricks[i]
    if (!b.active) continue
    if (b.x < ballX+ballSize && ballX-ballSize < b.x+brickW && b.y < ballY+ballSize && ballY-ballSize < b.y+brickH) {
      b.active = false
      numOfBricks -= 1
      dy = -dy
      break
    }
  }
}

async function draw() {
  drawRect('#e1e6e8', 0, 0, w, h, "#190026")
  drawCircle('#00ffa6', ballX, ballY, ballSize)
  for (var i = 0; i < bricks.length; i++) {
    var b = bricks[i]
    if (!b.active) continue
    drawRect(colours[i], b.x, b.y, brickW, brickH, "#0b2a42")
  }
  drawRect('#00ffa6', padX-padW/2, padY, padW, padH, "#190026")
}

async function drawRect(color, x, y, w, h, s) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.fill()
  ctx.strokeStyle = s;
  ctx.stroke()
}

async function drawCircle(color, x, y, r) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2*Math.PI, false)
  ctx.fill()
  ctx.strokeStyle = "#190026";
  ctx.stroke()
}

async function initCamera() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(250, 250, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  document.getElementById("webcam-container").style.border = "1px solid black";
  }

async function loop() {
  webcam.update(); // update the webcam frame
  temp = await predict();
  movePaddle(temp);
  winCheck()
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let maxIndex = 0;
  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > prediction[maxIndex].probability) {
      maxIndex = i;
    }
  }

  const classPrediction = prediction[maxIndex].className;
  return(classPrediction)
}

async function movePaddle(temp){
    if(clickFlag == 1){
    if(temp === "left"){
      if (padX > padW/2) padX-=5;
    }
    if(temp === "right"){
      if (padX < w-padW/2) padX+=5;
    }
  }
}

async function winCheck(){
  if(numOfBricks == 0){
    if(clickFlag == 1){
      alert("You Win!")
      document.getElementById("wrapper" ).hidden = true
      document.getElementById("titleScreen").hidden = false
      ballY = 0
    }
  }else if(ballY == 561){
    alert("Game over!")
    document.getElementById("wrapper" ).hidden = true
    document.getElementById("titleScreen").hidden = false
    ballY = 0
  }
}

initCamera()
