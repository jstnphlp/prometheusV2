import * as THREE from "three";

export type HeroAtmosphereTuning = {
  farCloudSpeed: number;
  midCloudSpeed: number;
  farDistortion: number;
  midDistortion: number;
  sunIntensity: number;
  sunRayOpacity: number;
  sunMovement: number;
};

export const defaultHeroAtmosphereTuning: HeroAtmosphereTuning = {
  farCloudSpeed: 0.01,
  midCloudSpeed: 0.018,
  farDistortion: 0.0012,
  midDistortion: 0.0018,
  sunIntensity: 0.34,
  sunRayOpacity: 0.22,
  sunMovement: 0.014,
};

type HeroAtmosphereOptions = {
  host: HTMLElement;
  textureUrl: string;
  signal: AbortSignal;
  reducedMotion: boolean;
  tuning?: HeroAtmosphereTuning;
};

export type HeroAtmosphereScene = {
  setVisible: (visible: boolean) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setTuning: (tuning: HeroAtmosphereTuning) => void;
  dispose: () => void;
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;

  uniform sampler2D uSky;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform float uFocalX;
  uniform float uTime;
  uniform float uFarCloudSpeed;
  uniform float uMidCloudSpeed;
  uniform float uFarDistortion;
  uniform float uMidDistortion;
  uniform float uSunIntensity;
  uniform float uSunRayOpacity;
  uniform float uSunMovement;

  const float TAU = 6.28318530718;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float valueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 fraction = fract(point);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);

    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, fraction.x), mix(c, d, fraction.x), fraction.y);
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 4; octave++) {
      value += valueNoise(point) * amplitude;
      point = point * 2.03 + vec2(17.13, 9.47);
      amplitude *= 0.5;
    }

    return value;
  }

  vec2 coverUv(vec2 uv) {
    float viewportAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = uImageSize.x / max(uImageSize.y, 1.0);
    vec2 result = uv;

    if (viewportAspect > imageAspect) {
      float visibleHeight = imageAspect / viewportAspect;
      result.y = uv.y * visibleHeight + (1.0 - visibleHeight) * 0.5;
    } else {
      float visibleWidth = viewportAspect / imageAspect;
      result.x = uv.x * visibleWidth + (1.0 - visibleWidth) * uFocalX;
    }

    return result;
  }

  float ellipseMask(vec2 uv, vec2 center, vec2 radius, float feather) {
    float distanceFromCenter = length((uv - center) / radius);
    return 1.0 - smoothstep(1.0 - feather, 1.0, distanceFromCenter);
  }

  float gaussian(float value, float center, float width) {
    float normalized = (value - center) / max(width, 0.0001);
    return exp(-(normalized * normalized));
  }

  void main() {
    vec2 imageUv = coverUv(vUv);
    float time = uTime;

    // These broad masks are deliberately soft. They only animate selected cloud
    // regions in the flattened prototype sky, avoiding whole-image wobble.
    float farMask = ellipseMask(
      imageUv,
      vec2(0.68, 0.67),
      vec2(0.31, 0.25),
      0.42
    );
    float midMask = ellipseMask(
      imageUv,
      vec2(0.27, 0.55),
      vec2(0.33, 0.37),
      0.46
    );

    float farPhase = time * uFarCloudSpeed * TAU;
    float midPhase = time * uMidCloudSpeed * TAU;

    vec2 farDrift = vec2(
      sin(farPhase) * 0.0024,
      cos(farPhase * 0.73) * 0.0007
    );
    vec2 midDrift = vec2(
      sin(midPhase + 1.7) * 0.0035,
      cos(midPhase * 0.67 + 0.4) * 0.0011
    );

    float farNoise = fbm(imageUv * 3.2 + vec2(time * 0.004, -time * 0.002));
    float midNoise = fbm(imageUv * 4.4 + vec2(-time * 0.006, time * 0.003));

    vec2 warpedUv = imageUv;
    warpedUv += farMask * (
      farDrift +
      vec2(farNoise - 0.5, (0.5 - farNoise) * 0.55) * uFarDistortion
    );
    warpedUv += midMask * (
      midDrift +
      vec2(midNoise - 0.5, (midNoise - 0.5) * 0.4) * uMidDistortion
    );
    warpedUv = clamp(warpedUv, vec2(0.001), vec2(0.999));

    vec4 sky = texture2D(uSky, warpedUv);
    vec3 color = sky.rgb;

    // The source sits just beyond the upper-left edge. A few broad angular
    // bands create soft painterly rays rather than a lens-flare effect.
    vec2 movingSun = vec2(
      -0.035 + sin(time * uSunMovement) * 0.012,
      1.045 + cos(time * uSunMovement * 0.73) * 0.008
    );
    vec2 fromSun = imageUv - movingSun;
    float sunDistance = length(fromSun);
    float sunAngle = atan(fromSun.y, fromSun.x);

    float rayOne = gaussian(sunAngle, -0.72, 0.07);
    float rayTwo = gaussian(sunAngle, -0.84, 0.055);
    float rayThree = gaussian(sunAngle, -0.96, 0.075);
    float distanceEnvelope =
      smoothstep(0.06, 0.28, sunDistance) *
      (1.0 - smoothstep(0.78, 1.32, sunDistance));

    float rayNoise = 0.76 + fbm(
      imageUv * 5.5 + vec2(time * 0.012, -time * 0.006)
    ) * 0.24;
    float slowBreath = 0.92 + sin(time * 0.17) * 0.08;
    float rays = (rayOne * 0.8 + rayTwo + rayThree * 0.65)
      * distanceEnvelope
      * rayNoise
      * slowBreath
      * uSunRayOpacity;

    float halo = exp(-sunDistance * sunDistance * 7.5) * uSunIntensity;
    vec3 warmLight = vec3(1.0, 0.79, 0.52);

    color += warmLight * (rays + halo * 0.16);

    gl_FragColor = vec4(color, sky.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

async function loadSkyTexture(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Could not load hero atmosphere texture (${response.status}).`);
  }

  const blob = await response.blob();
  if (signal.aborted) {
    throw new DOMException("Hero atmosphere loading cancelled", "AbortError");
  }

  const objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;

  try {
    await image.decode();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  if (signal.aborted) {
    throw new DOMException("Hero atmosphere loading cancelled", "AbortError");
  }

  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return {
    texture,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

export async function createHeroAtmosphere(
  options: HeroAtmosphereOptions,
): Promise<HeroAtmosphereScene> {
  const {
    host,
    signal,
    textureUrl,
    tuning = defaultHeroAtmosphereTuning,
  } = options;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.pointerEvents = "none";
  host.replaceChildren(renderer.domElement);

  let loadedTexture: Awaited<ReturnType<typeof loadSkyTexture>>;
  try {
    loadedTexture = await loadSkyTexture(textureUrl, signal);
  } catch (error) {
    renderer.dispose();
    renderer.forceContextLoss();
    host.replaceChildren();
    throw error;
  }

  if (signal.aborted) {
    loadedTexture.texture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    host.replaceChildren();
    throw new DOMException("Hero atmosphere loading cancelled", "AbortError");
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const uniforms = {
    uSky: { value: loadedTexture.texture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uImageSize: {
      value: new THREE.Vector2(loadedTexture.width, loadedTexture.height),
    },
    uFocalX: { value: 0.5 },
    uTime: { value: 0 },
    uFarCloudSpeed: { value: tuning.farCloudSpeed },
    uMidCloudSpeed: { value: tuning.midCloudSpeed },
    uFarDistortion: { value: tuning.farDistortion },
    uMidDistortion: { value: tuning.midDistortion },
    uSunIntensity: { value: tuning.sunIntensity },
    uSunRayOpacity: { value: tuning.sunRayOpacity },
    uSunMovement: { value: tuning.sunMovement },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
    toneMapped: true,
  });
  const quad = new THREE.Mesh(geometry, material);
  quad.frustumCulled = false;
  scene.add(quad);

  let reducedMotion = options.reducedMotion;
  let requestedVisible = true;
  let pageVisible = !document.hidden;
  let disposed = false;
  let frame = 0;
  let elapsed = 0;
  let last = performance.now();

  function isAnimating() {
    return requestedVisible && pageVisible && !reducedMotion && !disposed;
  }

  function requestRender() {
    if (disposed || !requestedVisible || !pageVisible || frame) return;
    last = performance.now();
    frame = requestAnimationFrame(render);
  }

  function render(now: number) {
    frame = 0;
    if (disposed || !requestedVisible || !pageVisible) return;

    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!reducedMotion) elapsed += delta;
    uniforms.uTime.value = reducedMotion ? 0 : elapsed;

    renderer.render(scene, camera);

    if (isAnimating()) {
      frame = requestAnimationFrame(render);
    }
  }

  function resize() {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width, height);
    uniforms.uFocalX.value = window.matchMedia("(max-width: 640px)").matches
      ? 0.6
      : 0.5;

    requestRender();
  }

  function handleVisibilityChange() {
    pageVisible = !document.hidden;
    if (pageVisible) requestRender();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  resize();
  requestRender();

  return {
    setVisible(visible) {
      requestedVisible = visible;
      if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (visible) {
        requestRender();
      }
    },

    setReducedMotion(reduced) {
      reducedMotion = reduced;
      if (reduced) {
        elapsed = 0;
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      }
      requestRender();
    },

    setTuning(next) {
      uniforms.uFarCloudSpeed.value = next.farCloudSpeed;
      uniforms.uMidCloudSpeed.value = next.midCloudSpeed;
      uniforms.uFarDistortion.value = next.farDistortion;
      uniforms.uMidDistortion.value = next.midDistortion;
      uniforms.uSunIntensity.value = next.sunIntensity;
      uniforms.uSunRayOpacity.value = next.sunRayOpacity;
      uniforms.uSunMovement.value = next.sunMovement;
      requestRender();
    },

    dispose() {
      if (disposed) return;
      disposed = true;

      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      scene.remove(quad);
      geometry.dispose();
      material.dispose();
      loadedTexture.texture.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
      host.replaceChildren();
    },
  };
}
