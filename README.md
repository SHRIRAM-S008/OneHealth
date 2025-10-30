# OneHealth Grid Website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/artifactssih-4576s-projects/v0-one-health-grid-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/fYct0s0yXbN)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/artifactssih-4576s-projects/v0-one-health-grid-website](https://vercel.com/artifactssih-4576s-projects/v0-one-health-grid-website)**

## Manual Deployment to Vercel

To deploy this application manually to Vercel:

1. **Prerequisites**:
   - Create a Vercel account at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm install -g vercel`

2. **Deploy Steps**:
   ```bash
   # Navigate to your project directory
   cd onehealth-grid
   
   # Install dependencies
   pnpm install
   
   # Deploy to Vercel
   vercel --prod
   ```

3. **Environment Variables**:
   Set the following environment variables in your Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. **Build Settings** (if not auto-detected):
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/fYct0s0yXbN](https://v0.app/chat/projects/fYct0s0yXbN)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository