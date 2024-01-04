uniform float uDuration;
varying vec2 vUv;
varying vec3 vPosition;
varying float vDistortion;

float rand(vec3 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  float scale = uDuration;
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  vDistortion = scale * rand(position);
  gl_Position = mvpMatrix * vec4(position * (vDistortion + 1.0), 1.0);
  gl_PointSize = 2.0;
  vUv = uv;
  vPosition = position;
}