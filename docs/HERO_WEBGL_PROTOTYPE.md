# Hero WebGL atmosphere prototype

This prototype lives only on the `feat/hero-webgl-atmosphere-prototype` branch.

The production homepage hero remains unchanged.

## Preview route

Open:

`/hero-webgl-test`

The route reuses the current hero composition and overlays a narrow Three.js client boundary for the sky.

## Current prototype behavior

The prototype intentionally uses the existing `/assets/hero/sky.webp` as its only source texture.

It demonstrates:

- cover-style responsive sky cropping that follows the current hero behavior
- slow movement limited to two broad cloud regions instead of warping the entire image
- very low-amplitude procedural cloud deformation
- warm procedural sunlight from the upper-left
- slow sunlight intensity and direction variation
- device-pixel-ratio clamping
- pausing when the prototype is outside the viewport or the document is hidden
- a static frame when `prefers-reduced-motion` is enabled
- the existing static sky as a fallback if WebGL cannot initialize

## Why this first pass does not use extracted cloud PNGs

The final art pipeline should use a clean sky plate plus transparent cloud layers.

Those assets need to be extracted from the exact production painting so the moving layers match the original brushwork and composition.

The first branch prototype instead tests the WebGL motion system against the existing source image without changing production assets.

The scene boundary is designed so final cloud textures can replace the temporary masked sampling without changing the page-level architecture.

## Relevant files

- `src/app/hero-webgl-test/page.tsx`
- `src/components/portfolio/hero/hero-atmosphere-client.tsx`
- `src/components/portfolio/hero/hero-atmosphere.module.css`
- `src/lib/three/create-hero-atmosphere.ts`

## Tuning

The initial motion values live in `defaultHeroAtmosphereTuning` in `create-hero-atmosphere.ts`.

They are intentionally conservative.

The values to tune after visual review are:

- `farCloudSpeed`
- `midCloudSpeed`
- `farDistortion`
- `midDistortion`
- `sunIntensity`
- `sunRayOpacity`
- `sunMovement`

## Next checkpoint

Review the preview route at desktop and mobile sizes.

The next iteration should answer two questions:

1. Does the restrained WebGL motion feel like the painting is alive without looking distorted?
2. Is the procedural sunlight convincing enough to keep, or should it be replaced or supplemented by a painted light mask?

Only after that visual checkpoint should the exact clean-sky and transparent cloud assets be prepared and the production hero considered for integration.
