export const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 position;
uniform float u_time;
uniform float u_entropy;

void main() {
  float t = u_time * 0.45;
  float scale = 1.0 + sin(t + (position.y * 3.9420)) * (0.02 * (1.0 + u_entropy));
  gl_Position = vec4(position * scale, 0.0, 1.0);
}`;

export const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_entropy;
uniform float u_phonon_induction;
uniform float u_syntropic_braid;
uniform float u_torsion_field;
uniform float u_theme;
out vec4 fragColor;

float pseudoNoise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
}

float structuralFBM(vec2 p, float time) {
  float value = 0.0;
  float amplitude = 0.6;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * sin(p.x * frequency + time) * cos(p.y * frequency - time);
    p = rotate2D(p, 0.5) * 2.1;
    amplitude *= 0.55;
    frequency *= 1.8;
  }
  return value;
}

float evaluateManifold(vec2 uv, float time, float entropy, float braid, float torsion) {
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  vec2 warped = rotate2D(uv, sin(r * 5.0 - time) * (0.3 + entropy + torsion * 0.8));
  float fbm1 = structuralFBM(warped * 2.0, time);
  float fbm2 = structuralFBM(warped * 4.0 + vec2(fbm1 * braid * 2.0), time * 0.8);
  float glitch = step(0.86, entropy * pseudoNoise(vec2(floor(time * 10.6), warped.y)));
  float baseField = sin((theta * 4.0) + (r * 3.9420) + (fbm2 * 3.0));
  if (glitch > 0.5) baseField = cos((theta * 8.0) - (r * 7.8840) + (fbm1 * 5.0));
  return baseField + fbm1 * 0.25;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * 0.45;
  float totalSplit = (u_phonon_induction * 0.12) + (u_torsion_field * 0.08);
  float rChannel = evaluateManifold(uv - vec2(totalSplit, 0.0), t, u_entropy, u_syntropic_braid, u_torsion_field);
  float gChannel = evaluateManifold(uv, t, u_entropy, u_syntropic_braid, u_torsion_field);
  float bChannel = evaluateManifold(uv + vec2(totalSplit, 0.0), t, u_entropy, u_syntropic_braid, u_torsion_field);
  vec2 gridUV = uv + vec2(gChannel * u_torsion_field * 0.5);
  float gridPattern = abs(sin(gridUV.y * 80.0) * cos(gridUV.x * 80.0));
  float gridMask = smoothstep(0.0, 0.06, gridPattern);
  vec3 cyanoBase = vec3(0.0, 0.95, 1.0);
  vec3 indigoBase = vec3(0.34, 0.31, 0.93);
  vec3 laserMagenta = vec3(1.0, 0.0, 0.55);
  vec3 compositeMesh = vec3(rChannel, gChannel, bChannel);
  vec3 dynamicBackground = mix(indigoBase * 0.04, laserMagenta * 0.12, clamp(u_torsion_field * 0.5, 0.0, 1.0));
  vec3 finalColor = mix(dynamicBackground, cyanoBase, clamp(compositeMesh + ((1.0 - gridMask) * 0.7), 0.0, 1.0));
  finalColor += vec3(pseudoNoise(uv - t) * 0.15 * u_entropy);
  float vignette = 1.0 - smoothstep(0.0, 2.4, length(uv));
  float luminance = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 blackTheme = vec3(luminance * vignette);
  vec3 whiteTheme = vec3(1.0 - luminance * vignette);
  fragColor = vec4(mix(blackTheme, whiteTheme, u_theme), 1.0);
}`;