precision mediump float;

varying vec4 v_color;
varying vec2 v_texCoords;

uniform sampler2D u_noise;
uniform sampler2D u_texture;
uniform mat4 u_projTrans;

uniform float u_noise_scale;
uniform vec2 u_noise_scroll_velocity;
uniform float u_distortion;
uniform float u_time;

uniform vec4 u_Color;

void main(void) {
  vec2 waveUV = v_texCoords * u_noise_scale;
  vec2 travel = u_noise_scroll_velocity * u_time;
  vec2 uv = v_texCoords;
  uv += (u_distortion * (texture2D(u_noise, waveUV + travel).rg - 0.5));
  waveUV += 0.2;
  uv += (u_distortion * (texture2D(u_noise, waveUV - travel).rg - 0.5));
  vec3 color = texture2D(u_texture, uv).rgb;
  gl_FragColor = vec4(color, 1.0) * u_Color;
}
