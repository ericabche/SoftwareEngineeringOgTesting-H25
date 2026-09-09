# Deployment Scripts

This folder contains all the deployment scripts for the Buss-App Østfold project.

## Scripts Overview

### 1. `auto-deploy.sh`
- **Purpose**: Automatically checks for new commits every 5 minutes
- **Usage**: Run via cron job
- **Cron**: `*/5 * * * * /home/philipag/bin/auto-deploy.sh`

### 2. `deploy.sh`
- **Purpose**: Main deployment script that handles the complete deployment process
- **Usage**: `~/bin/deploy.sh`
- **Process**: Pulls code, builds frontend, deploys to web directory

### 3. `manage-services.sh`
- **Purpose**: Manages backend service lifecycle
- **Usage**: 
  - `~/bin/manage-services.sh start` - Start backend
  - `~/bin/manage-services.sh stop` - Stop backend
  - `~/bin/manage-services.sh restart` - Restart backend
  - `~/bin/manage-services.sh status` - Show status
  - `~/bin/manage-services.sh logs` - View logs

### 4. `webhook.php`
- **Purpose**: GitHub webhook endpoint (currently not working due to server restrictions)
- **Status**: Blocked by server with 403 error
- **Alternative**: Use polling approach with `auto-deploy.sh`

### 5. `health-check.sh`
- **Purpose**: Comprehensive health monitoring for frontend and backend
- **Usage**: 
  - `~/bin/health-check.sh frontend` - Check only frontend
  - `~/bin/health-check.sh backend` - Check only backend
  - `~/bin/health-check.sh all` - Check both services (default)

## Installation

1. Copy all scripts to `~/bin/` directory:
   ```bash
   cp scripts/*.sh ~/bin/
   ```

2. Make scripts executable:
   ```bash
   chmod +x ~/bin/*.sh
   ```

3. Set up cron job for auto-deployment:
   ```bash
   (crontab -l 2>/dev/null; echo "*/5 * * * * /home/philipag/bin/auto-deploy.sh") | crontab -
   ```

## Configuration

### SSH Key Setup
1. Generate SSH key: `ssh-keygen -t ed25519 -C "philipag@itstud.hiof.no"`
2. Add public key to GitHub: `cat ~/.ssh/id_ed25519.pub`
3. Test connection: `ssh -T git@github.com`

### Vite Configuration
Ensure `Frontend/vite.config.ts` has:
```typescript
export default defineConfig({
  plugins: [react()],
  base: './', // Critical for subdirectory deployment
})
```

## Monitoring

### Log Files
- `~/logs/auto-deploy.log` - Auto-deployment activity
- `~/logs/deploy.log` - Detailed deployment process
- `~/logs/backend.log` - Backend application logs

### View Logs
```bash
# Auto-deployment
tail -f ~/logs/auto-deploy.log

# Deployment process
tail -f ~/logs/deploy.log

# Backend logs
tail -f ~/logs/backend.log
```

### Health Checks
```bash
# Check all services
~/bin/health-check.sh

# Check only frontend
~/bin/health-check.sh frontend

# Check only backend
~/bin/health-check.sh backend
```


### Manual Operations

```bash
# Force redeploy
~/bin/deploy.sh

# Check last deployed commit
cat ~/logs/last-commit.txt

# View deployment history
grep "Deploying commit" ~/logs/deploy.log
```

## Environment

- **Server**: itstud.hiof.no
- **User**: philipag
- **Web Directory**: ~/htdocs/app/
- **Production URL**: https://itstud.hiof.no/~philipag/app/
- **Repository**: git@github.com:craftpag/crispy-bassoon-ostfold.git
