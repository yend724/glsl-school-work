uniform float uDuration;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
varying vec2 vUv;
varying vec3 vPosition;

float amplitude = 30.0;
float speed = 10.0;

vec4 getFromColor(vec2 uv){
  return texture2D(uTexture1, uv);
}
vec4 getToColor(vec2 uv){
  return texture2D(uTexture1, uv);
}

void main() {
  float progress = uDuration;
  vec2 dir = vUv - vec2(.5);
  float dist = length(dir);

  vec2 p = vUv;

  if (dist > progress) {
    gl_FragColor = mix(getFromColor(p), getToColor(p), progress);
  } else {
    vec2 offset = dir * sin(dist * amplitude - progress * speed);
    gl_FragColor = mix(getFromColor(p + offset), getToColor(p), progress);
  }
}