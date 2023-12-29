uniform float uTime;
varying vec2 vUv;

void main() {
  float r = sin(uTime / 1000.0) * 0.5 + 0.5;
  gl_FragColor = vec4(r, 0.5, 0.0, 1.0);
}