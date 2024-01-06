attribute vec3 color;
varying vec3 vPosition;
varying vec3 vColor;

void main() {
  mat4 imvpMatrix = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix;
  gl_Position = imvpMatrix * vec4(position, 1.0);
  vColor = instanceColor;
}