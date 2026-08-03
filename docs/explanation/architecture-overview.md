# Architecture Overview

Cofit Starter is a lightweight single Next.js app for small LINE / Web tools.

## Chassis

The chassis includes:

- auth
- DB connection with in-memory fallback
- user identity resolution
- LINE LIFF
- LINE notify
- Gemini analyze endpoint
- i18n
- module registry and HQ toggle UI

## Module Boundary

Product-specific features should be implemented as modules. The starter should stay generic enough to copy into future projects.

## Promotion Path

Use `create-cofit-repo` full-stack monorepo for downstream products when they need:

- independent backend deployment
- worker jobs
- shared FE/BE schemas
- e2e release gates
- heavier CI and package governance
