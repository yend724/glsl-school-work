uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // float r = sin(uTime / 1000.0) * 0.5 + 0.5;
  if(gl_PointCoord.x < 0.5 && gl_PointCoord.y < 0.5) {
    discard;
  }
  gl_FragColor = vec4(vPosition, 1.0);
}