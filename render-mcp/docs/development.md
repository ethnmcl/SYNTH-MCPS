# Development

## Local setup
```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run format`
- `npm run test`
- `npm run typecheck`

## Adding endpoint support
1. Add/update endpoint module in `src/render/endpoints`.
2. Map response shape in `src/render/mappers.ts`.
3. Expose in `RenderGateway`.
4. Use from tools/resources.
5. Add tests and docs updates.
