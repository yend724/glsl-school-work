uniform float uProgress;
uniform float uTime;
attribute vec3 color;
varying vec4 vWorldPosition;
varying vec3 vColor;

 float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
  }

void main() {
  float xtime = sin(uTime * 100.);
  float ytime = cos(uTime * 100.);
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  mat4 imvpMatrix = mvpMatrix * instanceMatrix;
  float random = rand(instanceMatrix[3].xz);

  vec3 pos = vec3(position.x + random * xtime * 5.0 * uProgress, position.y + random * ytime * 5.0 * uProgress, position.z);
  gl_Position = imvpMatrix * vec4(pos, 1.0);
  vColor = instanceColor;
  vWorldPosition = imvpMatrix * vec4(position, 1.0);
}