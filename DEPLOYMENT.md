# Deployment Instructions for ADDRESS.xyz/travel

## Prerequisites on Server
- Node.js 18+ installed
- PM2 or similar process manager for backend
- Nginx configured

## Step 1: Upload Code to Server
```bash
# On your local machine
scp -r travel_companion user@ADDRESS.xyz:/path/to/destination/
```

## Step 2: Backend Setup
```bash
cd /path/to/travel_companion/backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed default templates
npm run db:seed

# Build for production
npm run build

# Start with PM2 (recommended)
pm2 start dist/server.js --name travel-companion-api
pm2 save
pm2 startup  # Follow instructions to enable autostart
```

## Step 3: Frontend Setup
```bash
cd /path/to/travel_companion/frontend

# Install dependencies
npm install

# Build for production
npm run build
# This creates the 'dist' folder with production files
```

## Step 4: Configure Nginx
```bash
# Edit your nginx config (usually /etc/nginx/sites-available/default or your domain config)
sudo nano /etc/nginx/sites-available/your-site

# Add the contents from nginx.conf file to your server block
# Make sure to update the alias path:
#   alias /path/to/travel_companion/frontend/dist;

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 5: Update Backend .env for Production
```bash
cd /path/to/travel_companion/backend
nano .env

# Change JWT_SECRET to a secure random string:
# JWT_SECRET="use-openssl-rand-hex-32-to-generate-this"
```

To generate secure JWT_SECRET:
```bash
openssl rand -hex 32
```

## Verify Deployment
- Visit: https://ADDRESS.xyz/travel
- Check backend: `pm2 logs travel-companion-api`
- Check nginx: `sudo tail -f /var/log/nginx/error.log`

## Useful PM2 Commands
```bash
pm2 list                    # List all processes
pm2 logs travel-companion-api  # View logs
pm2 restart travel-companion-api  # Restart backend
pm2 stop travel-companion-api    # Stop backend
pm2 delete travel-companion-api  # Remove from PM2
```

## Updating After Changes
```bash
# Backend
cd backend
git pull  # or upload new files
npm install
npm run build
pm2 restart travel-companion-api

# Frontend
cd frontend
git pull  # or upload new files
npm install
npm run build
# Nginx will serve the new dist folder automatically
```
