"use strict";

var ctx  = document.getElementById("mycan").getContext("2d"),
    buf = document.createElement("canvas").getContext("2d"),
    gameWidth = 1500,
    gameHeight = gameWidth,
    req,
    outcomes = ["DRAW!", "PLAYER ONE WINS!", "PLAYER TWO WINS!"],
    turn = 0;

var squares = [];

class Square {
  constructor(x, y, index, callback) {
    this.x = x;
    this.y = y;
    this.cb = callback;
    this.size = gameWidth/3;
    this.type = null;
    this.fill = "white";
    this.index = index;
  }
}

function logify() {
  if(squares[0].type !== null && squares[4].type == squares[0].type && squares[8].type == squares[0].type) return [(squares[0].type == "X") ? 1 : 2, [squares[0], squares[8]]];
  else if(squares[2].type !== null && squares[4].type == squares[2].type && squares[6].type == squares[2].type) return [(squares[2].type == "X") ? 1 : 2, [squares[2], squares[6]]];
  
  for(var i = 0; i < 3; i++) {
    if(squares[i].type !== null && squares[i+3].type == squares[i].type && squares[i+6].type == squares[i].type) return [(squares[i].type == "X") ? 1 : 2, [squares[i], squares[i+6]]];
    else if(squares[i*3].type !== null && squares[i*3+1].type == squares[i*3].type && squares[i*3+2].type == squares[i*3].type) return [(squares[i*3].type == "X") ? 1 : 2, [squares[i*3], squares[i*3+2]]];
  }
  
  for(var j = 0; j < squares.length; j++) {
    if(squares[j].type === null) break;
    else if(j == squares.length - 1) return [0];
  }
  
  return [undefined];
}

function clog(owo) {
  owo.type = (turn%2 === 0) ? "X" : "O";
  turn++;
  owo.fill = "#5A5E5F";
  ctx.canvas.style.cursor = "auto";
  var out = logify();
  if(out[0] >= 0) {
    for(var i = 0;i < squares.length; i++) {squares[i].fill = "#5A5E5F"}
    tempRender();
    if(out[0] > 0) {
      ctx.beginPath();
      ctx.lineWidth = out[1][0].size/8;
      ctx.strokeStyle = "white";
      ctx.lineCap = "round";
      ctx.moveTo((out[1][0].x+(out[1][0].size/2))/(gameWidth/ctx.canvas.width), (out[1][0].y+(out[1][0].size/2))/(gameHeight/ctx.canvas.height));
      ctx.lineTo((out[1][1].x+(out[1][1].size/2))/(gameWidth/ctx.canvas.width), (out[1][1].y+(out[1][1].size/2))/(gameHeight/ctx.canvas.height));
      // ctx.closePath();
      ctx.stroke();
    }
    
    stop();
  }
}

function tempRender() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  for(var i = 0, cur; i < squares.length; i++) {
    cur = squares[i];
    buf.fillStyle = cur.fill;
    
    buf.beginPath();
    buf.moveTo(cur.x, cur.y);
    
    buf.lineTo(cur.x + cur.size, cur.y);
    buf.lineTo(cur.x + cur.size, cur.y + cur.size);
    buf.lineTo(cur.x, cur.y + cur.size);
    
    buf.closePath();
    buf.fill();
    buf.stroke();
    
    if(cur.type !== null) {
      buf.fillStyle = "black";
      buf.font = cur.size*7/5 + "px Serif";
      buf.fillText(cur.type, cur.x, cur.y+cur.size-cur.size*0.05);
    }
  }
  
  ctx.drawImage(buf.canvas, 0, 0, buf.canvas.width, buf.canvas.height, 0, 0, ctx.canvas.width, ctx.canvas.height);
  buf.clearRect(0, 0, buf.canvas.width, buf.canvas.height);
}

function resizeCanvas() {
  var hwr = buf.canvas.height / buf.canvas.width, maxWidth = document.documentElement.clientWidth, maxHeight = document.documentElement.clientHeight;
  if(maxHeight / maxWidth > hwr) {
    ctx.canvas.height = maxWidth * hwr;
    ctx.canvas.width = maxWidth;
  } else {
    ctx.canvas.height = maxHeight;
    ctx.canvas.width = maxHeight / hwr;
  }
  
  tempRender();
}

function searchSquares(e) {
  if(e.target != ctx.canvas) return false;
  for(var i = 0, cur; i < squares.length; i++) {
    cur = squares[i];
    var scaledX = (gameWidth/ctx.canvas.width)*e.offsetX, scaledY = (gameHeight/ctx.canvas.height)*e.offsetY;
    if(scaledX > cur.x && scaledX < cur.x+cur.size && scaledY > cur.y && scaledY < cur.y+cur.size && cur.type === null) {
      return cur;
    }
  }
  
  return false;
}

function checkClicks(e) {
  var sqr = searchSquares(e);
  if(!sqr) return;
  sqr.cb(sqr);
}

function checkHover(e) {
  var sqr = searchSquares(e);
  if(!sqr) {ctx.canvas.style.cursor = "auto"; return;}
  ctx.canvas.style.cursor = "pointer";
}

function loop() {
  tempRender();
  req = requestAnimationFrame(loop);
}

function stop() {
  squares = [];
  cancelAnimationFrame(req);
}

function start() {
  stop();
  
  gameHeight = gameWidth;
  buf.canvas.width = gameWidth;
  buf.canvas.height = gameHeight;
  resizeCanvas();
  for(var i = 0; i < 3; i++) {
    for(var j = 0; j < 3; j++) {
      squares.push(new Square(j*(gameWidth/3), i*(gameHeight/3), i*3+j, clog));
    }
  }
  
  req = requestAnimationFrame(loop);
}

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("click", checkClicks);
  window.addEventListener("mousemove", checkHover);

start();