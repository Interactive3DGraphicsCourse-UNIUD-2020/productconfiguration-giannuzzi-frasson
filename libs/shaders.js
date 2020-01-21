function vertexShader() {
    return `
    uniform float displacementScale;
    uniform sampler2D displacementMap;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 uVv;
    varying vec3 wPosition;
    uniform vec2 textureRepeat;

    void main() {
        vec3 newPosition = position + normal * ((texture2D(displacementMap, uv * textureRepeat).xyz) * displacementScale);
        wPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vec4 vPos = modelViewMatrix * vec4(newPosition, 1.0);
        vPosition = vPos.xyz;
        vNormal = normalize(normalMatrix * normal);
        uVv = uv;
        gl_Position = projectionMatrix * vPos;
    }
    `
}
function fragmentShader() {
    return `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 uVv;
varying vec3 wPosition;
uniform vec3 pointLightPosition; // in world space
uniform vec3 pointLightPosition1; // in world space
uniform vec3 pointLightPosition2; // in world space
uniform vec3 clight;
uniform vec3 ambientLight;
uniform sampler2D specularMap;
uniform sampler2D diffuseMap;
uniform sampler2D roughnessMap;
uniform sampler2D normalMap;
uniform sampler2D aoMap;
uniform vec2 normalScale;
uniform vec2 textureRepeat;
uniform samplerCube envMap;
const float PI = 3.14159;

vec3 cdiff;
vec3 cspec;
float roughness;


vec3 FSchlick(float lDoth) {
    return (cspec + (vec3(1.0) - cspec) * pow(1.0 - lDoth, 5.0));
}

float DGGX(float nDoth, float alpha) {
    float alpha2 = alpha * alpha;
    float d = nDoth * nDoth * (alpha2 - 1.0) + 1.0;
    return (alpha2 / (PI * d * d));
}

float G1(float dotProduct, float k) {
    return (dotProduct / (dotProduct * (1.0 - k) + k));
}

float GSmith(float nDotv, float nDotl) {
    float k = roughness * roughness;
    return G1(nDotl, k) * G1(nDotv, k);
}

vec3 perturbNormal2Arb(vec3 eye_pos, vec3 surf_norm) {
    vec3 q0 = dFdx(eye_pos.xyz);
    vec3 q1 = dFdy(eye_pos.xyz);
    vec2 st0 = dFdx(uVv.st);
    vec2 st1 = dFdy(uVv.st);
    vec3 S = normalize(q0 * st1.t - q1 * st0.t);
    vec3 T = normalize(-q0 * st1.s + q1 * st0.s);
    vec3 N = surf_norm;
    vec3 mapN = texture2D(normalMap, uVv * textureRepeat).xyz * 2.0 - 1.0;
    mapN.xy = normalScale * mapN.xy;
    mat3 tsn = mat3(S, T, N);
    return normalize(tsn * mapN);
}

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix) {
    return normalize((vec4(dir, 0.0) * matrix).xyz);
}

void main() {
    
    vec3 n = perturbNormal2Arb(vPosition, normalize(vNormal));
    vec4 lPosition = viewMatrix * vec4(pointLightPosition, 1.0);
    vec4 lPosition1 = viewMatrix * vec4(pointLightPosition1, 1.0);
    vec4 lPosition2 = viewMatrix * vec4(pointLightPosition1, 1.0);
    vec3 l = normalize(lPosition.xyz - vPosition.xyz);
    vec3 l1 = normalize(lPosition1.xyz - vPosition.xyz);
    vec3 l2 = normalize(lPosition2.xyz - vPosition.xyz);
    vec3 v = normalize(-vPosition);
    vec3 h = normalize(v + l);
    vec3 h1 = normalize(v + l1);
    vec3 h2 = normalize(v + l2);
    
    //vec3 n = normalize( vNormal );  // interpolation destroys normalization, so we have to normalize
    

    // small quantity to prevent divisions by 0
    float nDotl = max(dot(n, l), 0.000001);
    float lDoth = max(dot(l, h), 0.000001);
    float nDoth = max(dot(n, h), 0.000001);
    float vDoth = max(dot(v, h), 0.000001);
    
    float nDotv = max(dot(n, v), 0.000001);
    
    // small quantity to prevent divisions by 0
    float nDotl1 = max(dot(n, l1), 0.000001);
    float lDoth1 = max(dot(l1, h1), 0.000001);
    float nDoth1 = max(dot(n, h1), 0.000001);
    float vDoth1 = max(dot(v, h1), 0.000001);
    
    // small quantity to prevent divisions by 0
    float nDotl2 = max(dot(n, l2), 0.000001);
    float lDoth2 = max(dot(l2, h2), 0.000001);
    float nDoth2 = max(dot(n, h2), 0.000001);
    float vDoth2 = max(dot(v, h2), 0.000001);
    
    
    cdiff = texture2D(diffuseMap, uVv * textureRepeat).rgb;
    // texture in sRGB, linearize
    cdiff = pow(cdiff, vec3(2.2));
    cspec = texture2D(specularMap, uVv * textureRepeat).rgb;
    // texture in sRGB, linearize
    cspec = pow(cspec, vec3(2.2));
    roughness = texture2D(roughnessMap, uVv * textureRepeat).r; // no need to linearize roughness map
    
    
    vec3 worldN = inverseTransformDirection(n, viewMatrix);
    vec3 worldV = cameraPosition - wPosition;
    vec3 r = normalize(reflect(-worldV, worldN));
    vec3 envLight = textureCube(envMap, vec3(-r.x, r.yz)).rgb;
    envLight = pow(envLight, vec3(2.2));
    
    vec3 fresnel = FSchlick(lDoth);
    vec3 fresnel1 = FSchlick(lDoth1);
    vec3 fresnel2 = FSchlick(lDoth2);
    
    vec3 BRDF = (vec3(1.0) - fresnel) * cdiff / PI + fresnel * GSmith(nDotv, nDotl) * DGGX(nDoth, roughness * roughness) /
    (4.0 * nDotl * nDotv);
    
    vec3 BRDF1 = (vec3(1.0) - fresnel1) * cdiff / PI + fresnel1 * GSmith(nDotv, nDotl1) * DGGX(nDoth1, roughness * roughness) /
    (4.0 * nDotl1 * nDotv);
    
    vec3 BRDF2 = (vec3(1.0) - fresnel2) * cdiff / PI + fresnel2 * GSmith(nDotv, nDotl2) * DGGX(nDoth2, roughness * roughness) /
    (4.0 * nDotl2 * nDotv);
    
    
    vec3 outRadiance = (PI * clight * nDotl * BRDF * envLight) + (PI * clight * nDotl1 * BRDF1 * envLight) + (PI * clight * nDotl2 * BRDF2 * envLight) + ambientLight * cdiff * texture2D(aoMap, uVv * textureRepeat).xyz;
    // gamma encode the final value
    gl_FragColor = vec4(pow(outRadiance, vec3(1.0 / 2.2)), 1.0);
    }
`
}