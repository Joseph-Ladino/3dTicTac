"use strict";

/*
    Written by Joe.L (https://github.com/Joseph-Ladino) (https://twitter.com/DumbPlusPlus)
    have fun
*/

var ctx = document.getElementById("mycan").getContext("2d");

    // fixes width and height
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

var objects = [],
    camera = new Vert3(0, 0, 1500),
    cameraBase = new Vert3(0, 0, 1500),
    e = new Vert3((ctx.canvas.width/2), (ctx.canvas.height/2), 200),
    projected = [],
    tx = 0,
    ty = 0;
    camera.orientation = [0, 0, 0];

function Vert3(...coords) {
  this.x = parseFloat(coords[0]);
  this.y = parseFloat(coords[1]);
  this.z = parseFloat(coords[2]);
  this.orientation = (coords[3]) ? coords[3] : [0, 0, 0];
}

function Vert2(...coords) {
  this.x = parseFloat(coords[0]);
  this.y = parseFloat(coords[1]);
}

function rotateX(vert, angle) {
  var base = {y:vert.y*1, z:vert.z*1}, rad = (360 + angle) * Math.PI/180, cos = Math.cos(rad), sin = Math.sin(rad);
  vert.y =  base.y*cos - base.z*sin;
  vert.z =  base.y*sin + base.z*cos;

  vert.orientation[0] = angle;
}

function rotateY(vert, angle) {
  var base = {x:vert.x*1, z:vert.z*1}, rad = (360 + angle) * Math.PI/180, cos = Math.cos(rad), sin = Math.sin(rad);
  vert.x = base.z*sin + base.x*cos;
  vert.z = -base.x*sin + base.z*cos;

  vert.orientation[1] = angle;
}

function rotateZ(vert, angle) {
  var base = {x:vert.x*1, y:vert.y*1}, rad = (360 + angle) * Math.PI/180, cos = Math.cos(rad), sin = Math.sin(rad);
  vert.x = base.x*cos - base.y*sin;
  vert.y = base.x*sin + base.y*cos;

  vert.orientation[2] = angle;
}

function rotate(vert, base, angleX, angleY, angleZ) {
  var noRef = new Vert3(base.x, base.y, base.z);

  if(angleY) rotateY(noRef, angleY);
  if(angleZ) rotateZ(noRef, angleZ);
  if(angleX) rotateX(noRef, angleX);

  vert.x = noRef.x;
  vert.y = noRef.y;
  vert.z = noRef.z;
  vert.orientation = noRef.orientation;
}

function rotateTo(parentObj, angleX, angleY, angleZ) {

  var noRef = [];
  for(var i = 0, temp; i < parentObj.base.length; i++) {
    temp  = parentObj.vertices[i];
    noRef[i] = new Vert3(temp.x, temp.y, temp.z);

    if(angleY) rotateY(noRef[i], angleY);
    if(angleZ) rotateZ(noRef[i], angleZ);
    if(angleX) rotateX(noRef[i], angleX);

    temp.x = noRef[i].x;
    temp.y = noRef[i].y;
    temp.z = noRef[i].z;
  }
}

function cameraTransform(obj) {

  // vector between vertice and camera (per dimension)
  var x = obj.x - camera.x,
      y = obj.y - camera.y,
      z = obj.z - camera.z,

      // sines of camera orientation
      sx = Math.sin(camera.orientation[0]*Math.PI/180),
      sy = Math.sin(camera.orientation[1]*Math.PI/180),
      sz = Math.sin(camera.orientation[2]*Math.PI/180),

      // cosines of camera orientation
      cx = Math.cos(camera.orientation[0]*Math.PI/180),
      cy = Math.cos(camera.orientation[1]*Math.PI/180),
      cz = Math.cos(camera.orientation[2]*Math.PI/180),

      // camera transformation
      dx = (cy * ((sz*y) + (cz*x))) - (sy*z),
      dy = (sx * ((cy*z) + (sy*((sz*y) + (cz*x))))) + (cx*((cz*y) - (sz*x))),
      dz = (cx * ((cy*z) + (sy*((sz*y) + (cz*x))))) - (sx*((cz*y) - (sz*x)));

      this.x = dx; this.y = dy; this.z = dz;
}

function project(obj) {
      // perspective projection
  var d = new cameraTransform(obj),
      outX = ((e.z/d.z)*d.x) + e.x,
      outY = ((e.z/d.z)*d.y) + e.y;

  // return new Vert2((e.z/obj.z)*obj.x+e.x, (e.z/obj.z)*obj.y+e.x);
  return new Vert2(outX, outY);
}

function projectBulk(arr) {
  var out = [];
  for(var i = 0; i < arr.length; i++) { out[i] = project(arr[i]) }
  return out;
}

function backcull(p) {
  var N = new Vert3(0, 0, 0),
      T = {x: p[0].x-camera.x, y: p[0].y-camera.y, z: p[0].z-camera.z},
      vec1 = {x: p[1].x-p[0].x, y: p[1].y-p[0].y, z: p[1].z-p[0].z},
      vec2 = {x: p[2].x-p[0].x, y: p[2].y-p[0].y, z: p[2].z-p[0].z};

  // cross product
  N.x = (vec1.y * vec2.z) - (vec1.z * vec2.y);
  N.y = (vec1.z * vec2.x) - (vec1.x * vec2.z);
  N.z = (vec1.x * vec2.y) - (vec1.y * vec2.x);

  // if the dot product of T and N is greater than 0, the polygon is facing away from the camera
  if((T.x * N.x) + (T.y * N.y) + (T.z * N.z) >= 0) return true;
  else return false;
}

function render(objects, canvas, dx, dy) {

  // Clears the canvas and sets the colors for stroke and fill
  canvas.clearRect(0, 0, 2*dx, 2*dy);

  canvas.strokeStyle = "black";
  e.x = dx + tx;
  e.y = dy + ty;

  // loops through parent objects
  for(var i = 0; i < objects.length; i++) {

    for(var kawaii = 0, t, t2; kawaii < objects[i].vertices.length; kawaii++) {
      t = objects[i].base[kawaii];
      t2 = objects[i].vertices[kawaii];
      t2.x = t.x * objects[i].scale;
      t2.y = t.y * objects[i].scale;
      t2.z = t.z * objects[i].scale;
    }

    rotateTo(objects[i], ...objects[i].orientation);

    var zBuf = [];
    projected = [];
    // loops through current parent's subobjects
    for(var j = 0; j < objects[i].subObjs.length; j++) {

      // loops through polygons in the current subobject
      for(var k = 0, tempval; k < (objects[i].subObjs[j].polygons).length; k++) {
        var zObj = {zval: 0, polygon: [], fillColor: "", cube: {}}, leastbeast = Infinity;

        // loops through vertices in the current polygon
        for(var l = 0; l < objects[i].subObjs[j].polygons[k].length; l++) {
          tempval = e.z - objects[i].subObjs[j].polygons[k][l].z;
          if(tempval < leastbeast) leastbeast = tempval;
        }

        zObj.zval = leastbeast;
        zObj.polygon = objects[i].subObjs[j].polygons[k];
        zObj.fillColor = objects[i].subObjs[j].fillColor;
        zObj.cube = objects[i].subObjs[j];
        zBuf.push(zObj);
        if(!backcull(zObj.polygon)) {
          projected.push({zval:leastbeast,polygon:projectBulk(objects[i].subObjs[j].polygons[k]),cube:objects[i].subObjs[j]});
        }
      }
    }

    zBuf.sort((a, b)=>{return (a.zval > b.zval) ? -1 : ((a.zval < b.zval) ? 1 : 0)});
    projected.sort((a, b)=>{return (a.zval > b.zval) ? -1 : ((a.zval < b.zval) ? 1 : 0)});

    for(var zCount = 0; zCount < zBuf.length; zCount++) {
      var verts = zBuf[zCount].polygon,
      P = project(verts[0]);

      canvas.fillStyle = zBuf[zCount].fillColor;
      canvas.beginPath();
      canvas.moveTo(P.x, P.y);

      // loops through vertices (excluding first one)
      for(var lego = 1; lego < verts.length; lego++) {
        P = project(verts[lego]);
        canvas.lineTo(P.x, P.y);
      }

      // ends path and draws
      canvas.closePath();
      canvas.fill();
      canvas.stroke();
    }
  }
}

function ParentObj3D(obj) {
  this.base = obj.base;
  this.vertices = obj.vertices;
  this.subObjs = obj.subObjs;
  this.scale = obj.scale;
  this.orientation = [0, 0, 0];
}

function SubObj3D(obj) {
  this.polygons = obj.polygons;
  this.fillColor = "rgba(0,0,0,0)";
  this.x = obj.x;
  this.y = obj.y;
  this.z = obj.z;
}

function loadObj(scale, fileString) {
  var subObjs = (fileString.indexOf("o ") > -1) ? fileString.split("o ") : fileString.split("g ");
  var parent = {vertices: [new Vert3(0, 0, 0)], base:[new Vert3(0, 0, 0)],  subObjs: [], scale: scale};

  // loops through all subobjects
  for(var i = 0; i < subObjs.length; i++) {

    // splits subobject string into array
    subObjs[i] = subObjs[i].split("\n");
    var out = {polygons: [], parent: {}}, cur, temp;

    // loops through all the items (lines) in the array
    for(var j = 0; j < subObjs[i].length; j++) {
      cur = subObjs[i][j], temp = cur.split(" ");
      // create vertex and push it to parent element
      if(temp[0] == "v") {
        var jkrowling = (!isNaN(parseInt(temp[1]))) ? 0 : 1;
        parent.vertices.push(new Vert3(temp[1+jkrowling], temp[2+jkrowling], temp[3+jkrowling]));
        parent.base.push(new Vert3(temp[1+jkrowling], temp[2+jkrowling], temp[3+jkrowling]));
      }
    }

    // loops through all the lines again
    for(j = 0; j < subObjs[i].length; j++) {
      cur = subObjs[i][j], temp = cur.split(" ");
      // loops through all the polygons, ties them to the previously established vertices, and pushes it to subobject
      if(temp[0] == "f") {
        var poly = [];
        for(var k = 1; k < temp.length; k++) {
          if(!isNaN(parseInt(temp[k].split("/")[0]))) poly.push(parent.vertices[parseInt(temp[k].split("/")[0])]);
        }
        out.polygons.push(poly);
      }
    }
    // pushes subobject to parent object
    // out.parent = parent;
    if(out.polygons.length > 0) parent.subObjs.push(new SubObj3D(out));
  }
  // pushes parent object to the objects array
  objects.push(new ParentObj3D(parent));
  render([objects[0]], ctx, ctx.canvas.width/2, ctx.canvas.height/2);
}

window.addEventListener("resize", ()=>{ctx.canvas.width = ctx.canvas.offsetWidth; ctx.canvas.height = ctx.canvas.offsetHeight; render(objects, ctx, ctx.canvas.width/2, ctx.canvas.height/2)});
