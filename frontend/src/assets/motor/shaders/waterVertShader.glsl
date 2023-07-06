attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;

uniform mat4 u_projTrans;
uniform mat4 u_mv;

varying vec4 v_color;
varying vec2 v_texCoords;

void main(void) {
  v_color = a_color;
  v_texCoords = a_texCoord;
  gl_Position = u_projTrans * u_mv * a_position;
}
