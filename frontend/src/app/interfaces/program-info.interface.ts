export interface programInfo{
  programId: WebGLProgram,
  attribLocations: attribLocations,
  uniformLocations: uniformLocations
}

interface attribLocations {
  vertexPosition: number,
  vertexNormal: number,
  texCoord: number,
}

interface uniformLocations {
  projectionMatrix: WebGLUniformLocation,
  modelViewMatrix: WebGLUniformLocation,
  normalMatrix: WebGLUniformLocation,
  uSampler: WebGLUniformLocation,
  uColor: WebGLUniformLocation,
  ambientMode: WebGLUniformLocation,
  lightIntensity: WebGLUniformLocation,
  lightPosition: WebGLUniformLocation,
  lightAmbient: WebGLUniformLocation,
  lightDiffuse: WebGLUniformLocation,
  lightSpecular: WebGLUniformLocation,
  materialKa: WebGLUniformLocation,
  materialKs: WebGLUniformLocation,
  materialKd: WebGLUniformLocation,
  materialShininess: WebGLUniformLocation,
  shaderCartoon: WebGLUniformLocation,
  mapaKd: WebGLUniformLocation
}
