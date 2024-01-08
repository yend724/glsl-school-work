uniform float uProgress;
uniform float uTime;
attribute vec3 color;
varying vec3 vColor;

float rand(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  mat4 imvpMatrix = mvpMatrix * instanceMatrix;

  float grey = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  float randX = rand(instanceColor.r) * 2.0 - 1.0;
  float randY = rand(instanceColor.g) * 2.0 - 1.0;
  float randZ = rand(instanceColor.b) * 2.0 - 1.0;

  float posX = position.x + randX * 50.0 * uProgress;
  float posY = position.y + randY * grey * 50.0 * uProgress;
  float posZ = position.z + randZ * grey * 100.0 * uProgress;

  gl_Position = imvpMatrix * vec4(posX, posY, posZ, 1.0);
  vColor = instanceColor;
}