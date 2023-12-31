varying vec2 vUv;
varying vec3 vPosition;
varying float vDistortion;

void main() {
  float range = vPosition.y / 137.0 + 0.5;
  float r = 1.0 - range;
  float g = 1.0 - range;
  float b = 1.0;
  float a = 1.0 - vDistortion;
  gl_FragColor = vec4(r, g, b, a);
}