# Production Setup Guide

## Overview

The frontend is configured to work in two environments:
- **Local Development**: `http://localhost:5173` (or similar Vite dev server port)
- **Production**: `https://itstud.hiof.no/~philipag/app/`

## How It Works

### Frontend Routes (Client-Side Routing)

- **Local**: Routes work at root level (`/login`, `/home`, etc.)
- **Production**: Routes work under `/~philipag/app/` (`/~philipag/app/login`, `/~philipag/app/home`, etc.)

The `getBasePath()` function in `src/utils/config.ts` automatically detects the environment and sets the correct base path for React Router.

### API Calls

- **Local**: API calls go to `http://localhost:8080` (your Java backend)
- **Production**: API calls go to `https://itstud.hiof.no` (root, not under `/app/`)

The `buildApiUrl()` function ensures API calls use the correct base URL:
- Frontend routes: `/~philipag/app/login` ✅
- API calls: `https://itstud.hiof.no/auth/login` ✅ (NOT `/~philipag/app/auth/login`)

## Configuration

### Automatic Detection

The system automatically detects if you're in production by checking:
1. `import.meta.env.PROD` (Vite build mode)
2. `window.location.hostname !== 'localhost'`

### Environment Variables (Optional)

If your backend API is on a different URL in production, you can set:

```bash
# .env.production
VITE_API_BASE=https://itstud.hiof.no:8080
```

Or if your backend is on a different path:

```bash
# .env.production
VITE_API_BASE=https://itstud.hiof.no/api
```

## Building for Production

```bash
npm run build
```

This will:
1. Build with base path `/~philipag/app/` (configured in `vite.config.ts`)
2. All routes will work correctly under `/~philipag/app/`
3. All API calls will go to `https://itstud.hiof.no` (or your configured `VITE_API_BASE`)

## Files Modified

1. **`src/utils/config.ts`** - Environment detection and API URL building
2. **`src/App.tsx`** - React Router with dynamic base path
3. **`src/pages/Login.tsx`** - Uses `buildApiUrl()` for API calls
4. **`src/RoutePlanner.tsx`** - Uses `buildApiUrl()` for API calls
5. **`vite.config.ts`** - Production build base path configuration

## Important Notes

⚠️ **API calls must NOT include the `/app/` prefix** - they go directly to the server root.

✅ **Frontend routes must use the base path** - React Router handles this automatically with `basename`.

✅ **All new API calls should use `buildApiUrl()`** - Never hardcode API URLs!

## Example Usage

```typescript
import { buildApiUrl } from '../utils/config';

// ✅ Correct
const url = buildApiUrl('auth/login');
// Local: http://localhost:8080/auth/login
// Prod: https://itstud.hiof.no/auth/login

// ❌ Wrong - Don't do this
const url = '/auth/login'; // Will try to call /~philipag/app/auth/login in prod!
```

