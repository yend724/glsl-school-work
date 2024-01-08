varying vec2 vUv;

void main() {
  vUv = uv;
  mat4 mvpMatrix = projectionMatrix * modelViewMatrix;
  gl_Position = mvpMatrix * vec4(position, 1.0);
}