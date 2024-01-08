uniform float uProgress;
uniform float uTime;
attribute vec3 color;
varying vec3 vColor;

 float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
  }

void main() {
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  mat4 imvpMatrix = mvpMatrix * instanceMatrix;

  float xTime = sin(uTime * 50.0);
  float yTime = cos(uTime * 50.0);
  float zTime = sin(uTime * 50.0);

  float random = rand(instanceMatrix[3].xy);
  float posX = position.x + random * xTime * 3.0 * uProgress;
  float posY = position.y + random * yTime * 3.0 * uProgress;
  float posZ = position.z + random * zTime * 10.0 * uProgress;

  gl_Position = imvpMatrix * vec4(posX, posY, posZ, 1.0);
  vColor = instanceColor;
}