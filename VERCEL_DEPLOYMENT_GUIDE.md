# Vercel Deployment Guide

## Overview
This guide provides instructions for deploying the OneHealth Grid application to Vercel. The application is already configured for Vercel deployment with all necessary files and settings.

## Files Added/Modified for Vercel Compatibility

### 1. vercel.json
Created a comprehensive Vercel configuration file with:
- Build settings for Next.js
- Route handling for API endpoints
- Security headers
- Environment variable placeholders

### 2. README.md
Updated with detailed deployment instructions including:
- Prerequisites for Vercel deployment
- Step-by-step deployment process
- Environment variable configuration
- Build settings information

## Vercel Deployment Process

### Prerequisites
1. Vercel account at [vercel.com](https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. Node.js and pnpm installed locally

### Deployment Steps
1. Navigate to your project directory:
   ```bash
   cd onehealth-grid
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Environment Variables
Set the following environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Build Settings
Vercel should auto-detect the following settings:
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

## Configuration Details

### Next.js Configuration (next.config.mjs)
The existing Next.js configuration is already Vercel-compatible:
- TypeScript build errors are ignored for faster builds
- Images are unoptimized for better compatibility

### TypeScript Configuration (tsconfig.json)
Standard Next.js TypeScript configuration with:
- ES6 target
- Module resolution set to bundler
- Path aliases for components and libraries

### PostCSS Configuration (postcss.config.mjs)
Configured with Tailwind CSS plugin for styling.

## Testing Deployment

### Local Build Test
Run the following command to test the build locally:
```bash
pnpm build
```

### Local Production Test
After building, test the production build locally:
```bash
pnpm start
```

## Troubleshooting

### Common Issues
1. **Environment Variables Missing**: Ensure all required environment variables are set in Vercel project settings.

2. **Build Failures**: Check the Vercel build logs for specific error messages.

3. **Runtime Errors**: Verify that Supabase credentials are correctly configured.

### Support
For deployment issues, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Vercel Deployment Guide](https://nextjs.org/docs/deployment)