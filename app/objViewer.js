//
//       Marcos Kazuya Yamazaki
//       NUSP: 7577622 
//       EP1-MAC420 Comp Grafica
//

var program;
var canvas;
var gl;

var numVertices = 36;

var pointsArray = [];
var normalsArray = [];
var normalsArraySmooth = [];
var normalsArrayFlat = [];
var tm = 1;

//variaveis
var flat_mode = 1;

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta =[0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe
var xleft = -1.0;
var xright = 1.0;
var ybottom = -1.0;
var ytop = 1.0;
var znear = -100.0;
var zfar = 100.0;

var flag = true;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = vec4(cross(t1, t2), 0);

     pointsArray.push(vertices[a]); 
     normalsArrayFlat.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArrayFlat.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArrayFlat.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArrayFlat.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArrayFlat.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArrayFlat.push(normal);    
}

// define faces of a cube
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function smoothCube(){
    normalsArray = normalsArrayFlat;
    var ordemVertice = [ 1,0,3, 1,3,2,
                         2,3,7, 2,7,6,
                         3,0,4, 3,4,7,
                         6,5,1, 6,1,2,
                         4,5,6, 4,6,7,
                         5,4,0, 5,0,1 ];
    var NormalSmooth = [];

    for(var i = 0; i < ordemVertice.length; i++) 
        if(NormalSmooth[ordemVertice[i]]) 
           NormalSmooth[ordemVertice[i]] = vec3(NormalSmooth[ordemVertice[i]][0] + normalsArrayFlat[i][0],
                                                NormalSmooth[ordemVertice[i]][1] + normalsArrayFlat[i][1],
                                                NormalSmooth[ordemVertice[i]][2] + normalsArrayFlat[i][2] );
        else NormalSmooth[ordemVertice[i]] = vec3(normalsArrayFlat[i]);
    for(var i = 0; i < NormalSmooth.length; i++) normalize(NormalSmooth[i]);
    for(var i = 0; i < ordemVertice.length; i++) normalsArraySmooth.push(vec4(NormalSmooth[ordemVertice[i]], 0.0));
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
  
    // draw simple cube for starters
    colorCube();
    smoothCube();
    
    // create vertex and normal buffers
    createBuffers();

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("zoom+").onclick = function(){tm += 0.075;};
    document.getElementById("zoom-").onclick = function(){tm -= 0.075;};
    document.getElementById("flat").onclick = function(){
        flat_mode = 1;
        normalsArray = normalsArrayFlat;
        createBuffers();
    };
    document.getElementById("smooth").onclick = function(){
        flat_mode = 0;
        normalsArray = normalsArraySmooth;
        createBuffers();
    };
    /*document.getElementById("tamanho").onclick = function(){
        alert("height: " + window.innerHeight + "...width: " + window.innerWidth);
        alert("height: " + canvas.clientHeight + "...width: " + canvas.clientWidth);
    };*/
    document.getElementById('files').onchange = function (evt) {
        // TO DO: load OBJ file and display
        loadObjFile(evt);
    };

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
     
    render();
}

var render = function() {
    //resize(canvas);

    var displayWidth  = window.innerWidth;
    // Computing the right display height so that the hole page fits the web browser window without (vertical) scrolls
    var displayHeight = window.innerHeight - (document.body.clientHeight - canvas.clientHeight);

    // Computing the right scale matrix to resize canvas
    var min = Math.min(displayWidth,displayHeight);
    scaleMatrix = scale( min/displayWidth, min/displayHeight, min/displayWidth);

    if (canvas.width  != displayWidth || canvas.height != displayHeight) {
    canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
    // Resizing viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //var proporcao = window.innerHeight/window.innerWidth;
    //gl.viewport( 0, 0, canvas.clientWidht, canvas.clientHeight );
      
    if (flag) theta[axis] += 2.0;
            
    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);
    
    modelViewMatrix = mult(modelViewMatrix, scaleMatrix);
    
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    modelViewMatrix = mult(modelViewMatrix, scale(tm,tm,tm)); //function scale( x, y, z ) <<<

    /*var p1 = canvas.clientHeight/canvas.clientWidth;
    var p2 = canvas.clientWidth/canvas.clientHeight;
    var p = [
        vec3(1,p1,p1),
        vec3(p1,1,p1), //ok
        vec3(p1,p1,1),
        vec3(1,1,p1),
        vec3(1,p2,1), //ok
        vec3(p2,1,1)
    ];


    if(canvas.clientHeight < canvas.clientWidth) {
        modelViewMatrix = mult(modelViewMatrix, scale(p[axis]));
    } else {    
        modelViewMatrix = mult(modelViewMatrix, scale(p[axis+3]));
    }
    */
    
    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
    requestAnimFrame(render);
}



function createBuffers(points, normals) {
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

}

function calc_normal(a, b, c) {
     var t1 = subtract(b, a);
     var t2 = subtract(c, b);
     var normal = vec4(cross(t1, t2), 0);

     normalsArrayFlat.push(normal); 
     normalsArrayFlat.push(normal); 
     normalsArrayFlat.push(normal);       
}

function loadObject(objInf) {
    pointsArray.length = 0;
    normalsArrayFlat.length = 0;
    normalsArraySmooth.length = 0;
    var normalTemp = [];
    var objTipo = 0;

    var ordemVertice = [];
    var ordemNormal = [];

    // TO DO: apply transformation to the object so that he is centered at the origin
    for(var i = 0; i < objInf.vert.length; i++) {
        var ajust = objInf.vert[i];
        ajust[0] = ajust[0] - objInf.diffx;
        ajust[1] = ajust[1] - objInf.diffy;
        ajust[2] = ajust[2] - objInf.diffz;
        //pointsArray.push(ajust);
    }

    // TO DO: convert strings into array of vertex and normal vectors
    var tempV;
    tempV = objInf.fac[0];
    if(tempV.search(/\/\//) != -1) objTipo = 1;
    else if(tempV.search(/\/\d+\//)) objTipo = 2;

    for(var i = 0; i < objInf.fac.length; i++) {
        tempV = objInf.fac[i];

        if(objTipo == 1) {
            // obj: f v//vn v//vn v//vn
            tempV = tempV.split(/\/\//);
            tempV[0] = parseInt(tempV[0]) - 1;
            tempV[1] = parseInt(tempV[1]) - 1;

            ordemVertice.push(tempV[0]);
            ordemNormal.push(tempV[1]);

            pointsArray.push(objInf.vert[tempV[0]]);
            normalTemp.push(objInf.norm[tempV[1]]);
        }
        else if(objTipo == 2) {
            // obj: f v/vt/vn v/vt/vn v/vt/vn

            tempV = tempV.split(/\//);
            tempV[0] = parseInt(tempV[0]) - 1;
            tempV[2] = parseInt(tempV[2]) - 1;

            ordemVertice.push(tempV[0]);
            ordemNormal.push(tempV[1]);

            pointsArray.push(objInf.vert[tempV[0]]);
            normalTemp.push(objInf.norm[tempV[2]]);
        }
        else {
            // obj: f v v v
            tempV = parseInt(tempV) - 1;

            ordemVertice.push(tempV);
            pointsArray.push(objInf.vert[tempV]);
        }
    }

    //verificar se o arquivo obj esta gravado no modo flat ou smooth
    if(objTipo == 1 || objTipo == 2){
        if(ordemNormal[0] == ordemNormal[1] && ordemNormal[0] == ordemNormal[2]) 
            normalsArrayFlat = normalTemp;
        else normalsArraySmooth = normalTemp;
    }

    if(normalsArrayFlat.length == 0) {
        //calcula flat normais
        for(var i = 0; i < pointsArray.length; i = i + 3){
            calc_normal(pointsArray[i], pointsArray[i+1], pointsArray[i+2]);
        }
    }
    
    var NormalSmooth = []; // para cada vertice
    if(normalsArraySmooth.length == 0) {
        for(var i = 0; i < objInf.fac.length; i++) 
            if(NormalSmooth[ordemVertice[i]]) 
                NormalSmooth[ordemVertice[i]] = vec3(NormalSmooth[ordemVertice[i]][0] + normalsArrayFlat[i][0],
                                                     NormalSmooth[ordemVertice[i]][1] + normalsArrayFlat[i][1],
                                                     NormalSmooth[ordemVertice[i]][2] + normalsArrayFlat[i][2] );
            else NormalSmooth[ordemVertice[i]] = vec3(normalsArrayFlat[i]);
        for(var i = 0; i < NormalSmooth.length; i++) normalize(NormalSmooth[i]);
        for(var i = 0; i < ordemVertice.length; i++) normalsArraySmooth.push(vec4(NormalSmooth[ordemVertice[i]], 0.0));
    }

    normalsArray = normalsArrayFlat;  
    createBuffers();
    numVertices = objInf.fac.length;
}
