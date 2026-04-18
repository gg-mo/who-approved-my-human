# Agent Tea

Your AI has tea about you. Agent Tea turns agent feedback into a personality type.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
See [docs/deployment-env.md](docs/deployment-env.md) for required environment variables.

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## E2E Skeleton

```bash
npm run test:e2e
```

This lists Playwright tests without requiring browser installation.
Run `npm run test:e2e:run` after installing Playwright browsers.
