# Working rules for this repo

- TypeScript strict. No `any` in scene code.
- All scene constants live in src/scene/constants.ts. No magic numbers inline.
- All project content lives in src/data/plots.ts. Never hardcode copy into components.
- Frame-rate independence: use `1 - Math.pow(decay, dt)` for damping, never a fixed lerp alpha.
- Never mutate React state inside useFrame. Use refs.
- Every new mesh: decide castShadow and receiveShadow explicitly. Don't leave both on by default.
- Reuse geometries and materials. Instance anything that appears more than 8 times.
- Run `npm run build` before declaring a phase done. Zero TS errors, zero console warnings.
- Test at 1440px, 1024px, 768px and 390px widths before declaring a phase done.
