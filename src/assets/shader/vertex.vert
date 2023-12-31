uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  float scale = 1.0 - sin(uTime / 1000.0) * 0.5 + 0.5;
  gl_Position = mvpMatrix * vec4(position * (scale * 0.5 + 0.5), 1.0);
  gl_PointSize = 8.0;
  vUv = uv;
  vPosition = position;
}