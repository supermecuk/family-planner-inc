# GitHub Supermecuk Monorepo

A monorepo web application built with pnpm workspaces, designed for easy migration to Turborepo.

## Structure

```
├── apps/
│   └── web/                    # Next.js web application
├── packages/
│   ├── ui/                     # Shared UI components
│   └── shared/                 # Shared utilities and types
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── tsconfig.base.json          # Base TypeScript configuration
```

## Prerequisites

- ✅ Node.js v18+ (currently v22.15.1)
- ✅ pnpm v10+ (currently v10.14.0) 
- Firebase (for database - to be configured)

## Development

### Install dependencies
```bash
pnpm install
```

### Run the web app
```bash
pnpm dev
```

### Build all packages
```bash
pnpm build
```

### Lint all packages
```bash
pnpm lint
```

### Type check all packages
```bash
pnpm type-check
```

## Package Details

### apps/web
- Next.js 15 with App Router
- TypeScript and Tailwind CSS
- Uses shared packages: `@repo/ui` and `@repo/shared`

### packages/ui
- Shared React components (Button, etc.)
- Styled with Tailwind CSS
- Exported via `@repo/ui`

### packages/shared
- Shared utilities (date formatting, validation)
- TypeScript types (User interface)
- Exported via `@repo/shared`

## Migration to Turborepo

When you're ready to migrate to Turborepo for better build caching and task orchestration:

### 1. Install Turborepo
```bash
pnpm add -DW turbo
```

### 2. Create turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {}
  }
}
```

### 3. Update package.json scripts
Replace pnpm commands with turbo:
```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  }
}
```

### 4. Benefits after migration
- ✅ Incremental builds with smart caching
- ✅ Parallel task execution
- ✅ Remote caching (optional)
- ✅ Better CI/CD performance
- ✅ Visual dependency graphs

The current structure already follows Turborepo conventions, making migration seamless!

## Next Steps

1. Configure Firebase for your database
2. Add more shared packages as needed
3. Consider migrating to Turborepo when you need advanced build optimization
4. Add testing setup (Jest, Playwright, etc.)
5. Set up CI/CD pipeline
