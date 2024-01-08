uniform sampler2D uTexture;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float t = uTime * 5.0;
  float amount = smoothstep(0.0, 1.0, uProgress) * 0.06;
  vec2 uvOffset = vec2(cos(uv.y * 20.0 + t), sin(uv.x * 20.0 - t)) * amount;
  vec3 color = texture2D(uTexture, uv + uvOffset * uProgress).rgb;
  gl_FragColor = vec4(color, 1.0 - uProgress);
}