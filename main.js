function main()
{
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  var vertices = [];

  var cubePoints = [
    [-0.5,  0.5,  0.5],   // A, 0
    [-0.5, -0.5,  0.5],   // B, 1
    [ 0.5, -0.5,  0.5],   // C, 2 
    [ 0.5,  0.5,  0.5],   // D, 3
    [-0.5,  0.5, -0.5],   // E, 4
    [-0.5, -0.5, -0.5],   // F, 5
    [ 0.5, -0.5, -0.5],   // G, 6
    [ 0.5,  0.5, -0.5]    // H, 7 
  ];

  var cubeColors = [
    [],
    [1.0, 0.0, 0.0],    // merah
    [0.0, 1.0, 0.0],    // hijau
    [0.0, 0.0, 1.0],    // biru
    [1.0, 1.0, 1.0],    // putih
    [1.0, 0.5, 0.0],    // oranye
    [1.0, 1.0, 0.0],    // kuning
    []
  ];

  function quad(a, b, c, d)
  {
    var indices = [a, b, c, c, d, a];
    for (var i = 0; i < indices.length; i++)
    {
      for (var j = 0; j < 3; j++)
      {
        vertices.push(cubePoints[indices[i]][j]);
      }
      for (var j = 0; j < 3; j++)
      {
        vertices.push(cubeColors[a][j]);
      }
    }
  }
  
  quad(1, 2, 3, 0); // Kubus depan
  quad(2, 6, 7, 3); // Kubus kanan
  quad(3, 7, 4, 0); // Kubus atas
  quad(4, 5, 1, 0); // Kubus kiri
  quad(5, 4, 7, 6); // Kubus belakang
  quad(6, 2, 1, 5); // Kubus bawah

  var vertexBuffer = gl.createBuffer(); //pointer ke gl di alam gpu
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var vertexShaderCode = document.getElementById("vertexShaderCode").text;

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);

  var fragmentShaderCode = document.getElementById("fragmentShaderCode").text;

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var aPosition = gl.getAttribLocation(shaderProgram, "a_Position");
  var aColor = gl.getAttribLocation(shaderProgram, "a_Color");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aPosition);
  gl.enableVertexAttribArray(aColor);

  gl.viewport(100, 0, canvas.height, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  var primitive = gl.TRIANGLES;
  var offset = 0;
  var count = 36;  // Jumlah verteks yang akan digambar

  var model = glMatrix.mat4.create();
  var view = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(
    view,
    [0.0, 0.0, 2.0], // di mana posisi kamera (posisi)
    [0.0, 0.0, -2.0], // ke mana kamera menghadap (vektor)
    [0.0, 1.0, 0.0] // ke mana arah atas kamera (vektor)
  );
  var projection = glMatrix.mat4.create();
  glMatrix.mat4.perspective(
    projection,
    glMatrix.glMatrix.toRadian(90), // fov dalam radian
    1.0,  // rasio aspek
    0.5,  // near
    10.0  // far
  );
  var uModel = gl.getUniformLocation(shaderProgram, 'u_Model');
  var uView = gl.getUniformLocation(shaderProgram, 'u_View');
  var uProjection = gl.getUniformLocation(shaderProgram, 'u_Projection');

  var uAmbientColor = gl.getUniformLocation(shaderProgram, 'u_AmbientColor');
  gl.uniform3fv(uAmbientColor, [0.2, 0.4, 0.6]);

  function render()
  {
    var theta = glMatrix.glMatrix.toRadian(1); // 1 derajat
    glMatrix.mat4.rotate(model, model, theta, [1.0, 1.0, 1.0]);
    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniformMatrix4fv(uProjection, false, projection);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(primitive, offset, count);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
