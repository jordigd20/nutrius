attribute vec4 a_position;

uniform mat4 u_matrix_pro;
uniform mat4 u_matrix_view;

void main() {
  gl_Position = u_matrix_pro * u_matrix_view * a_position;
}
