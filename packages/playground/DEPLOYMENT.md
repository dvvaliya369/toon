# TOON Playground Deployment Guide

This guide explains how to deploy the TOON Playground to various hosting platforms.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Git repository access

## Local Development

```bash
# From the monorepo root
pnpm install
pnpm build
pnpm playground

# Or directly from the playground directory
cd packages/playground
pnpm dev
```

The playground will be available at `http://localhost:3000`

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications with zero configuration.

#### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# From the playground directory
cd packages/playground
vercel

# For production deployment
vercel --prod
```

#### Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Set the root directory to `packages/playground`
5. Vercel will auto-detect Next.js and configure build settings
6. Click "Deploy"

#### Environment Variables

No environment variables are required for basic functionality.

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# From the playground directory
cd packages/playground
netlify deploy

# For production
netlify deploy --prod
```

**Build Settings:**
- Build command: `cd ../.. && pnpm install && pnpm build && cd packages/playground && pnpm build`
- Publish directory: `packages/playground/.next`
- Base directory: `/`

### Option 3: Docker

Create a `Dockerfile` in the playground directory:

```dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Build stage
FROM base AS builder
WORKDIR /app
COPY ../.. .
RUN pnpm install
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/packages/playground/.next ./packages/playground/.next
COPY --from=builder /app/packages/playground/public ./packages/playground/public
COPY --from=builder /app/packages/playground/package.json ./packages/playground/package.json
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/packages/playground
EXPOSE 3000
CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t toon-playground .
docker run -p 3000:3000 toon-playground
```

### Option 4: Static Export (GitHub Pages, etc.)

If you want to deploy as a static site:

1. Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@toon-format/toon'],
}
```

2. Build:

```bash
pnpm build
```

3. Deploy the `out` directory to any static hosting service.

## Custom Domain

### Vercel

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Netlify

1. Go to "Domain settings"
2. Add custom domain
3. Configure DNS

## Performance Optimization

The playground is already optimized with:

- Server-side rendering for initial load
- Code splitting for optimal bundle size
- Tailwind CSS for minimal CSS footprint
- Next.js automatic optimizations

## Monitoring

Consider adding:

- **Vercel Analytics**: Built-in for Vercel deployments
- **Google Analytics**: Add tracking code to `app/layout.tsx`
- **Sentry**: For error tracking

## Troubleshooting

### Build Fails

- Ensure all dependencies are installed: `pnpm install`
- Build the toon package first: `cd packages/toon && pnpm build`
- Check Node.js version: `node --version` (should be 18+)

### Module Not Found Errors

- Verify workspace dependencies are correctly linked
- Run `pnpm install` from the monorepo root
- Check that `@toon-format/toon` is built

### Performance Issues

- Enable Next.js caching
- Use CDN for static assets
- Consider edge deployment (Vercel Edge Functions)

## Support

For issues or questions:
- GitHub Issues: https://github.com/toon-format/toon/issues
- Documentation: https://toonformat.dev
