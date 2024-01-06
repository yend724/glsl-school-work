uniform float uTime;
varying vec3 vColor;
varying vec4 vWorldPosition;

float range (float pos) {
  return (pos + 100.0) / 200.0;
}
void main() {
  // vec3 color = vColor + cos(vColor * uTime) * 0.2;
  gl_FragColor = vec4(vColor, 1.0);
  // gl_FragColor = vec4(range(vWorldPosition.x), range(vWorldPosition.y), 0., 1.0);
}