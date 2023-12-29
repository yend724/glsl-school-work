varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = mvpMatrix * vec4(position, 1.0);
  gl_PointSize = 16.0;
}