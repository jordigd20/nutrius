precision mediump float;	// Precision media

struct LightInfo {
  vec4 Position; // Luz en coordenadas de vista
  vec3 La; // Ambiental
  vec3 Ld; // Difusa
  vec3 Ls; // Especular
};
uniform LightInfo Light;

struct MaterialInfo {
  vec3 Ka;
  vec3 Kd;
  vec3 Ks;
  float Shininess;
  float MapaKd;
};
uniform MaterialInfo Material;

uniform sampler2D u_Sampler;
uniform int u_AmbientLightMode; // 0 -> Luz ambiente desactivada, 1 -> Luz ambiente activada
uniform int u_ShaderCartoon; // 0 -> Shader cartoon desactivado, 1 -> Shader cartoon activado
uniform vec3 u_LightIntensity;
uniform vec4 u_Color;

varying vec3 P; // Position
varying vec3 N; // Normal
varying vec2 v_TexCoord;

vec3 Phong() {
  // Calcular vectores Vértice -> Luz, Vértice -> Observador, Reflexión y y Luz * Normal
  vec3 lightVector = normalize(Light.Position.xyz - P);
  vec3 viewVector = normalize(-P);
  vec3 reflVector = reflect(-lightVector, N);
  float lightDOTnormal = max(dot(lightVector, N), 0.0);

  float distance = length(Light.Position.xyz - P);
  float attenuation = 1.0/(0.25 + (0.01 * distance) + (0.003 * distance * distance));

  vec3 ambient = Light.La * Material.Ka;
  vec3 diffuse = Light.Ld * Material.Kd * attenuation * lightDOTnormal;
  vec3 specular = vec3(0.0);

  if (lightDOTnormal>0.0) {
    float reflDOTview = max (dot(reflVector, viewVector), 0.0);
    specular = Light.Ls * Material.Ks * pow(reflDOTview, Material.Shininess);
  }

  return u_LightIntensity * (ambient + diffuse + specular);
}

// Shader cartoon basado en: https://www.lighthouse3d.com/tutorials/glsl-12-tutorial/toon-shading-version-iii/
vec3 Cartoon(vec3 texelColor) {

    float intensity;
    vec3 color;
    intensity = dot(vec3(P),normalize(N));

    if(Material.MapaKd == 0.0){       //Si no tiene textura

      color = Material.Kd;

      if(intensity > 0.95){
          color = vec3(Material.Kd.r - 0.5, Material.Kd.g - 0.5, Material.Kd.b - 0.5);
      }
      else if(intensity > 0.75){
          color = vec3(Material.Kd.r - 0.3, Material.Kd.g - 0.3, Material.Kd.b - 0.3);
        }
      else if(intensity > 0.5){
        color = vec3(Material.Kd.r - 0.2, Material.Kd.g - 0.2, Material.Kd.b - 0.2);
      }
      else if(intensity > 0.25){
          color = vec3(Material.Kd.r - 0.1, Material.Kd.g - 0.1, Material.Kd.b - 0.1);
        }
    }
    else{                            //Si tiene textura

        color = vec3(texelColor.r, texelColor.g, texelColor.b);

        if(intensity > 0.95){
          color = vec3(texelColor.r - 0.5, texelColor.g - 0.5, texelColor.b - 0.5);
        }
        else if(intensity > 0.75){
          color = vec3(texelColor.r - 0.3, texelColor.g - 0.3, texelColor.b - 0.3);
        }
        else if(intensity > 0.5){
          color = vec3(texelColor.r - 0.2, texelColor.g - 0.2, texelColor.b - 0.2);
        }
        else if(intensity > 0.25){
          color = vec3(texelColor.r - 0.1, texelColor.g - 0.1, texelColor.b - 0.1);
        }
    }

    return color;
}

void main(void) {
  highp vec4 texelColor = texture2D(u_Sampler, v_TexCoord);

  vec3 finalLight = u_LightIntensity * Light.La;
  vec3 color = texelColor.rgb;

  float a = texelColor.a;

  if(u_ShaderCartoon == 1){                   //Activar shader cartoon en: src/app/motor-grafico/arbol-escena/TLuz.ts --> linea 56
    finalLight = u_LightIntensity * Light.Ld;
    color = Cartoon(texelColor.rgb);

    if(Material.MapaKd == 0.0){
      a = 1.0;
    }
  }

  else if(u_AmbientLightMode == 0) {
    finalLight = Phong();
  }

  gl_FragColor = vec4(color * finalLight, a) * u_Color;
}
