const URL = "https://teachablemachine.withgoogle.com/models/ZmW6WyBU4/";
let model, webcam, labelContainer, maxPredictions;

var w=500, h=600, ballSize=10, brickW=30, brickH=20, batW=100, batH=20
var numOfBricks = 0, clickFlag = 0
var ballX, ballY, dx, dy, bricks=[], batX=w/2, batY=h-50
var c = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
c.width = w; c.height = h

async function hideButton() {
  var button = document.querySelector("button");
  button.style.display = "none";
  clickFlag = 1
  runGame()
}

async function runGame(){
  init()
  setInterval(game, 5)
}

async function init() {
  bricks=[], ballX=w/2, ballY=h-100, dx=Math.random()-0.5, dy=-1.5
  for (var y = 0; y < 4; y++) {
    for (var x = y; x < 10-y; x++) {
      bricks.push({x: 50+x*brickW, y: 50+y*brickH, active: true})
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
  if (ballY-ballSize> batY) return false
  if (ballY+ballSize > batY && ballX+ballSize > batX-batW/2 && ballX-ballSize < batX+batW/2) dy = -dy
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
  drawRect('#eee', 0, 0, w, h)
  drawCircle('#f00', ballX, ballY, ballSize)
  for (var i = 0; i < bricks.length; i++) {
    var b = bricks[i]
    if (!b.active) continue
    drawRect('#0f0', b.x, b.y, brickW, brickH)
  }
  drawRect('#00f', batX-batW/2, batY, batW, batH)
}

async function drawRect(color, x, y, w, h) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.fill()
  ctx.stroke()
}

async function drawCircle(color, x, y, r) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2*Math.PI, false)
  ctx.fill()
}

async function initCamera() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);
}

async function loop() {
  webcam.update(); // update the webcam frame
  temp = await predict();
  moveBat(temp);
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

async function moveBat(temp){
  if(temp === "Case"){
    if (batX > batW/2) batX-=20;
  }
  if(temp === "Card"){
    if (batX < w-batW/2) batX+=20;
  }
}

async function winCheck(){
  if(numOfBricks == 0){
    if(clickFlag == 1){
      alert("You Win!")
      init()
    }
  }else if(ballY == 561.5){
    alert("Game over!")
    console.log(numOfBricks)
    init()
  }
}

initCamera()
