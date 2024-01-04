uniform float uDuration;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  float a = 1.0 - uDuration;
  gl_FragColor = vec4(vPosition, a);
}