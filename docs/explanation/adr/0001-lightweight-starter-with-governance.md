# ADR 0001: Lightweight Starter With Governance

## Status

Accepted

## Context

The starter should remain easy for PMs and clinicians to understand, but engineering handoff needs clearer repo conventions.

## Decision

Keep npm + JavaScript + single Next.js app, and add governance from `create-cofit-repo` where it does not make startup heavier:

- AI instructions
- GitHub templates
- Diataxis docs
- Node version files
- formatting defaults
- CI template

## Consequences

- The starter is still quick to copy and run.
- New downstream repos have clearer documentation and review surfaces.
- Full monorepo complexity stays opt-in for larger products.
