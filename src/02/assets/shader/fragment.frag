uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;

vec3 normalizePosition (vec3 position) {
  return position * 0.5 + 0.5;
}
void main() {
  vec3 normalizedPosition = normalizePosition(vPosition);
  float r = normalizedPosition.x + sin(uTime / 1000.0) * 0.5 + 0.5;
  float g = normalizedPosition.y + cos(uTime / 1000.0) * 0.5 + 0.5;
  float b = normalizedPosition.z + cos(uTime / 1000.0) * 0.5 + 0.5;
  gl_FragColor = vec4(r, g, b, 1.0);
}