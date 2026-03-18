# Azure Deployment Plan - Ilan CRM

**Status:** PLANNING  
**Mode:** MODIFY (add deployment infrastructure to existing Next.js app)  
**Created:** 2026-03-18

---

## Requirements Summary

- **App Type:** Next.js 15 Full-Stack CRM
- **Backend:** Node.js 20.x with Prisma ORM
- **Database:** PostgreSQL (required by Prisma)
- **Frontend:** React 18 + TypeScript
- **Auth:** Session-based with Zod validation
- **Package Manager:** npm
- **Build Output:** `.next/` (Next.js)

---

## Architecture Decision

| Component | Service | Reason |
|-----------|---------|--------|
| **Frontend + Backend** | Azure App Service (Node.js) | Single app, Next.js runs SSR + API in one process |
| **Database** | Azure Database for PostgreSQL (Flexible Server) | Required by Prisma, managed service, no maintenance |
| **Auth** | Session cookies (existing) | Already implemented, keep as-is |
| **Storage** | Azure Storage Blobs (future) | For property images, media, documents |
| **Monitoring** | Application Insights | APM, logs, performance tracking |

---

## Selected Recipe

**AZD (Azure Developer CLI)** with Bicep infrastructure

- ✅ Fastest deployment with one command (`azd up`)
- ✅ Built-in GitHub Actions CI/CD
- ✅ Environment isolation (dev/prod)
- ✅ Integrated with VS Code
- ✅ RBAC via Managed Identity

---

## Deployment Tasks

- [ ] Create `.azure/config.json` (environment config)
- [ ] Create `azure.yaml` (app manifest for azd)
- [ ] Generate Bicep infrastructure files:
  - `infra/main.bicep` (orchestrator)
  - `infra/app.bicep` (App Service)
  - `infra/database.bicep` (PostgreSQL)
  - `infra/monitoring.bicep` (Application Insights)
- [ ] Create `Dockerfile` for container build
- [ ] Create `docker-entrypoint.sh` for database migrations
- [ ] Add GitHub Actions workflow (`.github/workflows/`)
- [ ] Create `.env.sample` for deployment variables
- [ ] Validate with `azd validate`
- [ ] Deploy with `azd up`

---

## Target Azure Resources

| Resource | SKU | Region | Notes |
|----------|-----|--------|-------|
| App Service Plan | B3 | East US | Start small, can scale later |
| App Service | Node.js 20 | East US | Run Next.js app |
| PostgreSQL Flexible | D2s_v3 | East US | Development tier |
| Application Insights | Standard | East US | Monitoring + logs |
| Storage Account | Standard_LRS | East US | Future media uploads |

---

## Cost Estimate (Monthly)

- App Service (B3): ~$80
- PostgreSQL (D2s_v3): ~$300
- Application Insights: ~$0-5 (1GB ingestion free)
- **Total: ~$385/month**

---

## Post-Deployment

1. **Database Migration:** `npx prisma migrate deploy`
2. **Environment Variables:** Set in App Service config
3. **Custom Domain:** Add CNAME record
4. **SSL:** Auto-provisioned by Azure
5. **CI/CD:** GitHub Actions auto-deploys on main push

---

## Timeline

- **Phase 1 (Now):** Generate infrastructure code
- **Phase 2:** User approval
- **Phase 3:** Deploy with `azd up`
- **Phase 4:** Validation & verification

---

## Next Steps

✅ This plan is ready for user approval.  
👉 **User should confirm:**
1. Subscription ID / Resource Group
2. Region (East US / West US / UAE North?)
3. Budget approval
4. Custom domain name

Then we proceed to Phase 2: Generate infrastructure files.
