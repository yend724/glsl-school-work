varying vec2 vUv;
varying vec3 vPosition;

void main() {
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = mvpMatrix * vec4(position, 1.0);
  vUv = uv;
  vPosition = position;
}