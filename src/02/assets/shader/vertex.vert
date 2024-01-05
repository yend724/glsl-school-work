attribute vec3 color;
varying vec3 vPosition;
varying vec3 vColor;

void main() {
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = mvpMatrix * vec4(position, 1.0);
  gl_PointSize = 2.0;
  vColor = color;
  vPosition = position;
}