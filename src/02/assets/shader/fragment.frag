uniform float uTime;
varying vec3 vColor;

void main() {
  vec3 color = vColor + cos(vColor * uTime) * 0.2;
  gl_FragColor = vec4(color, 1.0);
}