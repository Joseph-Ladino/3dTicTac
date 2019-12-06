var req = null, cubeScale = 200, objString = "", viewLevel = 0, dragStartTime = 0, dragEndTime = 0, dragStartCoords = {x: 0, y: 0}, oldcubeRotation = [0, 0, 0], cubeRotation = [0, 0, 0], doIt = false;

function loop() {

  if(oldcubeRotation[0] < cubeRotation[0]) oldcubeRotation[0]++;
  else if(oldcubeRotation[0] > cubeRotation[0]) oldcubeRotation[0]--;
  if(oldcubeRotation[1] < cubeRotation[1]) oldcubeRotation[1]++;
  else if(oldcubeRotation[1] > cubeRotation[1]) oldcubeRotation[1]--;
  if(oldcubeRotation[2] < cubeRotation[2]) oldcubeRotation[2]++;
  else if(oldcubeRotation[2] > cubeRotation[2]) oldcubeRotation[2]--;
  //
  // objects[0].orientation[0] = (cubeRotation[0]%180 == 0) ? oldcubeRotation[1] : -oldcubeRotation[1];
  // objects[0].orientation[0] = oldcubeRotation[1];
  // if(cubeRotation[1]%90 == 0 && Math.abs(cubeRotation[1]) != 180) objects[0].orientation[2] = oldcubeRotation[0];
  // else objects[0].orientation[1] = oldcubeRotation[0];

  if(doIt) rotate(camera, cameraBase, oldcubeRotation[0], oldcubeRotation[1], oldcubeRotation[2]);

  render(objects, ctx, (ctx.canvas.width/2), ctx.canvas.height/2);
  req = requestAnimationFrame(loop);
}

function stop() {
  objects = [];
  camera = new Vert3(0, 0, 1500);
  cameraBase = new Vert3(0, 0, 1500);
  e = new Vert3((ctx.canvas.width/2), (ctx.canvas.height/2), 300);
  tx = 0;
  ty = 0;
  camera.orientation = [0, 0, 0];
  cancelAnimationFrame(req);
  req = null;
}

function togglePause() {
  if(req === null) req = requestAnimationFrame(loop);
  else {cancelAnimationFrame(req); req = null;}
}

function triangleArea(...points) {
  var p1 = points[0], p2 = points[1], p3 = points[2];
  return Math.abs((p1.x*(p2.y-p3.y) + p2.x*(p3.y-p1.y) + p3.x*(p1.y-p2.y))/2);
}

function whichCube(crd) {
  var all = [];
  for(var i = 0, poly, area; i < projected.length; i++) {
    poly = projected[i].polygon;
    area = triangleArea(poly[0], poly[1], poly[2])+triangleArea(poly[0], poly[3], poly[2]);
    if(area == triangleArea(poly[0], poly[1], crd)+triangleArea(poly[1], poly[2], crd)+triangleArea(poly[2], poly[3], crd)+triangleArea(poly[3], poly[0], crd)) all.push(projected[i].cube);
  }

  if(all.length > 0) return all[viewLevel];
  else return false;
}

function manageClick(e) {
  e.preventDefault();
  if(e.button == 0 && e.type == "mousedown") {
    var cur = whichCube(new Vert2(e.x, e.y));
    cur.fillColor = "rgba(255,0,0,0.75)";
  } else if(e.button == 2) {
    if(e.type == "mousedown") {
      dragStartTime = (new Date()).getTime()/100;
      dragStartCoords = new Vert2(e.x, e.y);
    } else {
      dragEndTime = (new Date()).getTime()/100;

      if(Math.abs(e.x-dragStartCoords.x) >= 50) cubeRotation[0] += (e.x-dragStartCoords.x > 0) ? -90 : 90;
      if(Math.abs(e.y-dragStartCoords.y) >= 50) cubeRotation[1] += (e.y-dragStartCoords.y > 0) ? 90 : -90;
      cubeRotation[0] %= 360;
      cubeRotation[1] %= 360;
    }
    return false;
  }
}

async function start() {
  var waiting = await fetch("./base.obj");
  objString = await waiting.text();
  stop();
  loadObj(cubeScale, objString);
  req = requestAnimationFrame(loop);
}

start();

ctx.canvas.addEventListener("mousedown", manageClick);
ctx.canvas.addEventListener("mouseup", manageClick);
ctx.canvas.addEventListener("contextmenu", (e)=>{e.preventDefault()});
