# Deployment Guide

This Turborepo contains multiple apps that can be deployed independently or together.

## 🚀 Apps in this Monorepo

- **Web App** (`apps/web`) - Next.js application
- **Expo App** (`apps/expo`) - React Native application
- **Shared Packages** (`packages/shared`, `packages/ui`) - Shared code between apps

## 📋 Deployment Options

### 1. Automatic Deployment (Recommended)

GitHub Actions workflows are set up to automatically deploy when you push to specific branches:

- **Web App**: Deploys on push to `main` or `alex` branches
- **Expo App**: Deploys on push to `main` or `alex` branches
- **All Apps**: Deploys everything when pushing to `main` branch

### 2. Manual Deployment

You can trigger deployments manually using Turborepo commands:

```bash
# Deploy web app only
pnpm deploy:web

# Deploy expo app only
pnpm deploy:expo

# Deploy all apps
pnpm deploy:all
```

### 3. Local Deployment Testing

Test your builds locally before deploying:

```bash
# Build all packages and apps
pnpm build

# Run linting and type checking
pnpm lint typecheck
```

## 🔧 Required Secrets

To enable automatic deployments, add these secrets to your GitHub repository:

### For Web App (Vercel)

- `VERCEL_TOKEN` - Your Vercel API token
- `ORG_ID` - Your Vercel organization ID
- `PROJECT_ID` - Your Vercel project ID

### For Expo App (EAS)

- `EXPO_TOKEN` - Your Expo access token

## 📁 Deployment Workflows

The following GitHub Actions workflows are configured:

- `.github/workflows/deploy-web.yml` - Web app deployment
- `.github/workflows/deploy-expo.yml` - Expo app deployment
- `.github/workflows/deploy-all.yml` - Deploy all apps

## 🎯 Deployment Triggers

### Path-based Triggers

- Web app deploys when changes are made to:
  - `apps/web/**`
  - `packages/**`
  - `pnpm-workspace.yaml`
  - `turbo.json`

- Expo app deploys when changes are made to:
  - `apps/expo/**`
  - `packages/**`
  - `pnpm-workspace.yaml`
  - `turbo.json`

### Branch-based Triggers

- `main` branch: Deploys all apps
- `alex` branch: Deploys individual apps based on changed paths

## 🛠️ Turborepo Configuration

The `turbo.json` includes deployment tasks that ensure:

- Dependencies are built in correct order
- Linting and type checking pass before deployment
- Build artifacts are properly cached

## 📝 Deployment Commands

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `pnpm deploy:web`  | Deploy web app only               |
| `pnpm deploy:expo` | Deploy expo app only              |
| `pnpm deploy:all`  | Deploy all apps                   |
| `pnpm build`       | Build all packages and apps       |
| `pnpm lint`        | Run linting on all packages       |
| `pnpm typecheck`   | Run type checking on all packages |

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are properly installed with `pnpm install`
2. **Lint Errors**: Run `pnpm lint:fix` to automatically fix linting issues
3. **Type Errors**: Run `pnpm typecheck` to identify TypeScript issues
4. **Cache Issues**: Clear Turborepo cache with `pnpm clean`

### Manual Deployment Steps

If automatic deployment fails, you can deploy manually:

1. **Web App (Vercel)**:

   ```bash
   cd apps/web
   vercel --prod
   ```

2. **Expo App (EAS)**:
   ```bash
   cd apps/expo
   eas build --platform all
   eas submit --platform all
   ```

## 📚 Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Expo EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
