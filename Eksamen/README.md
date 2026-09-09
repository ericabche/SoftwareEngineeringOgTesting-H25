# Buss-App Østfold - Gruppe 8

A modern bus application for Østfold's collective transport system, built with React TypeScript frontend and Spring Boot backend.

## Repository Structure
```
crispy-bassoon-ostfold/
├── Frontend/          # React TypeScript frontend
├── Backend/           # Spring Boot backend
├── scripts            # Scripts for Automation and workflows
├── .github/           # GitHub Actions workflows
├── docs/             # Project documentation
└── README.md         # This file
```

## Git Workflow (GitFlow)
- **main**: Production branch - contains stable, tested code
- **develop**: Integration branch - where all features are merged
- **feature/***: Feature branches for new functionality
  - `feature/user-authentication` (F01)
  - `feature/route-planning` (F02)
  - `feature/departure-overview` (F03)
  - `feature/digital-ticketing` (F04)
  - `feature/realtime-info` (F05)
  - `feature/admin-interface` (F06)
  - `feature/ci-cd-pipeline` (F07)

## Quick Start

### Frontend Development
```bash
cd Frontend
npm install
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
npm run type-check # TypeScript type checking
```

### Backend Development
```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

## Development Workflow
1. Create feature branch from `develop`
2. Make changes and commit using conventional commits
3. Push feature branch and create Pull Request
4. Code review and merge to `develop`
5. Deploy to staging environment
6. Merge `develop` to `main` for production release

## Conventional Commits
We use conventional commits for automatic changelog generation:
```bash
npm run commit  # Use commitizen for guided commits
```

## Testing & CI/CD Pipeline

### Pre-commit Testing
- **Setup**: Run `./scripts/setup-hooks.sh` (one-time setup)
- **Automatic**: Tests run before every commit
- **Frontend**: `npm test` + `npm run build`
- **Backend**: `mvn test` + `mvn compile`
- **Manual**: `./scripts/pre-commit.sh`

### Production Testing
- **Automatic**: Tests run on production server every 5 minutes
- **Deployment**: `~/bin/deploy.sh` (manual)
- **Health Checks**: `~/bin/health-check.sh`
- **Logs**: `~/logs/deploy.log`

### Documentation
- **Testing Guide**: [TESTING.md](TESTING.md)
- **Deployment Guide**: [scripts/README.md](scripts/README.md)

## Repository Access
- **Repository URL**: https://github.com/craftpag/crispy-bassoon-ostfold
- **Access**: All group members (Jimmy, Erica, Philip, Simen, Mohamed), subject responsible, and supervisor
- **Production server**: https://itstud.hiof.no/~philipag/app/

## Group Members
- Jimmy
- Erica  
- Philip
- Simen
- Mohamed
# Test deployment Tue Oct  7 07:43:48 CEST 2025
# Webhook test Tue Oct  7 07:44:35 CEST 2025
# Auto-deploy test Tue Oct  7 07:47:00 CEST 2025
# Polling test Tue Oct  7 07:49:05 CEST 2025
# Polling test Tue Oct  7 07:50:06 CEST 2025
