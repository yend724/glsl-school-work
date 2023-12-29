uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;

  float posX = position.x;
  gl_Position = mvpMatrix * vec4(posX, position.yz, 1.0);
}