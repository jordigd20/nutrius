attribute vec4 a_VertexPosition;
attribute vec3 a_VertexNormal;
attribute vec2 a_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_NormalMatrix;

varying vec2 v_TexCoord;
varying vec3 P; // Position
varying vec3 N; // Normal

void main(void) {
  v_TexCoord = a_TexCoord;
  P = vec3(u_ModelViewMatrix * a_VertexPosition);
  N = normalize(vec3(u_NormalMatrix * vec4(a_VertexNormal, 0.0)));
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_VertexPosition;
}
