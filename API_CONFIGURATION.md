# API Configuration Guide

## Environment Variables

The application uses the following environment variable for backend API configuration:

- **REACT_APP_API_URL**: Base URL for the backend API (default: `http://localhost:5000/api`)

## Local Development

For local development, a `.env.local` file is provided in the `Client` directory with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Production Deployment (Vercel)

To set the API URL for the Vercel deployment:

1. Go to your Vercel Dashboard: https://dashboard.render.com/
2. Find your KL-Pro project
3. Navigate to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://kl-pro-server-xxxxx.onrender.com/api`)

## Finding Your Render Backend URL

After deploying to Render, your backend URL will be in the format:
```
https://kl-pro-server-xxxxx.onrender.com/api
```

To find your specific URL:
1. Go to https://dashboard.render.com/
2. Find your `kl-pro-server` service
3. Copy the URL from the service details page
4. Append `/api` to the URL

## How It Works

- All fetch calls in the frontend now use `API_BASE_URL` imported from `src/config/apiConfig.js`
- The `API_BASE_URL` is derived from the `REACT_APP_API_URL` environment variable
- During development, it defaults to `http://localhost:5000/api`
- During production, it uses the configured Vercel environment variable
- React automatically includes environment variables prefixed with `REACT_APP_` during build time
