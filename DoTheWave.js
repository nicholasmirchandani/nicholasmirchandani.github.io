//
// start here
//

// mat4 = glMatrix.mat4;

const vsSource = `
attribute vec4 aVertexPosition;

void main() {
  gl_Position = aVertexPosition;
}
`;

const fsSource = `
precision mediump float;

uniform int screenX;
uniform int screenY;
uniform float sinSpeed;
uniform float blueLoc;
uniform float numWaves;

    void main() {
      float bigsin = abs(2.0 * sin(gl_FragCoord.x * 3.1415926535897932384626433832795 * numWaves / float(screenX)));
      float waveMath = bigsin * (0.4 * sin(sinSpeed * 15.0 - (gl_FragCoord.x * 0.01)) - 0.5 * sin(gl_FragCoord.x / float(screenX * 10)) + 1.1) / 2.0 / 2.0;

      //CLIP Above top Sin wave
      if (waveMath + 1.2 < gl_FragCoord.y / float(screenY) * 2.0 ) {
        discard;
      }
    
      //CLIP Below Bottom Sin Wave
      if (0.8 - (waveMath) > gl_FragCoord.y / float(screenY) * 2.0) {
        discard;
      }

      vec4 color;

      //Gradient set
      color.r = gl_FragCoord.y / float(screenY);
      color.g = gl_FragCoord.x / float(screenX);

      //Move the blue around from side to side
      if (!(gl_FragCoord.x / float(screenX) > blueLoc - 0.2 && (gl_FragCoord.x / float(screenX) - blueLoc + 0.1) < 0.3)) {
        color.b = 0.0;
      } else {
        color.b = 1.0 - (abs(blueLoc - gl_FragCoord.x / float(screenX))) * 10.0;
      }

      //Above top Sin wave
      if (waveMath + 1.0 < gl_FragCoord.y / float(screenY) * 2.0) {
        color.rg = color.rg * (waveMath) * (1.0 - ((gl_FragCoord.y / float(screenY)) * 2.0 - waveMath - 1.0) * 5.0);
        color.b *= (color.r + color.g);
      }

      //Below Bottom Sin Wave
      if (1.0 - (waveMath) > gl_FragCoord.y / float(screenY) * 2.0) {
        color.rg = color.rg * (waveMath) * (1.0 - ((1.0 - gl_FragCoord.y / float(screenY)) * 2.0 - waveMath - 1.0) * 5.0);
        color.b *= (color.r + color.g);
      }

      // Fade the area BETWEEN the sin waves
      if ((waveMath + 0.9 > gl_FragCoord.y / float(screenY / 2)) && (1.0 - (waveMath)) < gl_FragCoord.y / float(screenY) * 1.8) {
        color.rg /= 2.0;
        color.b *= abs(0.5-(gl_FragCoord.y/float(screenY)));
      }
      gl_FragColor = vec4(color.r, color.g, color.b, 1.0);
    }
  `;

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    
    // Error Checking
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Error checking
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function drawScene(gl, programInfo, buffers) {
    
}

function main() {
    const canvas = document.querySelector("#DoTheWave");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          // projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          // modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
          sinSpeedLocation: gl.getUniformLocation(shaderProgram, 'sinSpeed'),
          blueLocLocation: gl.getUniformLocation(shaderProgram, 'blueLoc'),
          numWavesLocation: gl.getUniformLocation(shaderProgram, 'numWaves'),
          screenXLocation: gl.getUniformLocation(shaderProgram, 'screenX'),
          screenYLocation: gl.getUniformLocation(shaderProgram, 'screenY'),
        },
    };

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    const bufferPosition = gl.createBuffer();  
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);
    // Now create an array of positions for the square.
  
    const positions = [
        1.0,  1.0,
      -1.0,  1.0,
        1.0, -1.0,
      -1.0, -1.0,
    ];
  
    // Now pass the list of positions into WebGL to build the
  
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(positions),
                  gl.STATIC_DRAW);
    
    const MAX_WAVES = 50;

    let step = 0.01;
    let increaseStep = false;
    let increaseNumWaves = true;

    let sinSpeed = 1.0;
    let blue = 0.0;
    let numWaves = 1;
    let screenX = canvas.width;
    let screenY = canvas.height;
          
    window.requestAnimationFrame(draw);

    function draw(timestamp) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      gl.clearDepth(1.0);                 // Clear everything
      gl.enable(gl.DEPTH_TEST);           // Enable depth testing
      // Clear the canvas before we start drawing on it.
    
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosition);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            2, // 2 Values
            gl.FLOAT, // Values are Floats
            false, // Don't normalize
            0, // Stride of 0
            0); // Offset of 0
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
      }
    
      // Tell WebGL to use our program when drawing
      gl.useProgram(programInfo.program);
    

      if (blue < 0.0) {
        increaseStep = true;
      } else if (blue > 1.0) {
        increaseStep = false;
      }
  
      if (increaseStep == true) {
        step = (0.001 - blue / 110.0); 
      } else {
        blue = blue > 1.0 ? 1.0 : blue;
        step = -0.001 + ((1.0 - blue) / 110.0);
      }

      if (numWaves > MAX_WAVES) {
        increaseNumWaves = false;
      } else if (numWaves <= 1) {
        increaseNumWaves = true;
      }

      if (increaseNumWaves) {
        numWaves += .001 * numWaves;
      } else {
        numWaves -= .001 * numWaves;
      }

      blue += step;
      sinSpeed -= step;
    
      // Set the shader uniforms
      gl.uniform1f(programInfo.uniformLocations.sinSpeedLocation, sinSpeed);
      gl.uniform1f(programInfo.uniformLocations.blueLocLocation, blue);
      gl.uniform1f(programInfo.uniformLocations.numWavesLocation, numWaves);
      gl.uniform1i(programInfo.uniformLocations.screenXLocation, screenX);
      gl.uniform1i(programInfo.uniformLocations.screenYLocation, screenY);
    
      {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
      }
      window.requestAnimationFrame(draw);
    }
}



window.onload = main;
