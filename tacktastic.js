var req = null, cubeSize = 300;

function loop() {
  render(objects, ctx, (ctx.canvas.width/2), ctx.cavas.height/2);
  
  req = requestAnimationFrame(loop);
}

function stop() {
  objects = [];
  fillColor = "";
  camera = new Vert3(0, 0, 600);
  e = new Vert3((ctx.canvas.width/2), (ctx.canvas.height/2), 200);
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

function start() {
  stop();
  var parent = {vertices: [new Vert3(0, 0, 0)], base:[new Vert3(0, 0, 0)],  subObjs: [], size: size/2};
  
  for(var i = 0, j = 0, k = 0, sub; i < 3; i++) {
    for(j = 0; j < 3; j++) {
      for(k = 0; k < 3; k++) {
        sub = {polygons:[]};
      }
    }
  }
  
  req = requestAnimationFrame(loop);
}