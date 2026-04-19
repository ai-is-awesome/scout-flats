# Refactor Rationale: Why the Structure Changed

## The Core Problem: Identity Confusion

The original structure had cognitive overload not because of any single folder, but because **the same conceptual job was spread across 3-4 different places with no clear reason why**.

---

## The "Where Does Data Travel?" Problem

Tracing data through this app — fetch from API → store as JSON → read back → push to Next.js — the code that handled each step was scattered with no clear pattern:

- **Fetching** lived in `/lib/providers/zolo/fetch.ts` *and also* `/services/zolo_services/zolo_fetch_data.ts`. Two parallel implementations of roughly the same thing. No obvious reason why both existed.
- **Saving** lived in `/lib/ingestion/save_json/zolo_save_json.ts` — but the actual write primitives lived in `/utils/write_json.ts`. So "ingestion" was a wrapper around a util. A layer that existed just to be a layer.
- **Reading** lived in `/lib/json_readers/zolo.ts` — but there were also read utilities in `/utils/read_json.ts`. Two places for the same concept.
- **Config** (the paths to all JSON files) lived in `/lib/config/json-data-paths.ts` — inside `lib`, not alongside the data or the utils.

To understand "how does Zolo data get read?", you had to ping-pong between `lib/json_readers`, `utils/read_json`, and `lib/config`. That's the overload.

---

## `lib/` Was Doing Too Much

`lib/` contained: API clients, config, ingestion logic, JSON readers, AND providers. That's essentially the entire application inside one folder. `lib/` was probably meant to be "internal shared utilities" but it grew into a second root alongside `src/`. This ambiguity meant there was never a confident answer to "is this a `lib` thing or a `src` thing?"

---

## `ingestion/save_json/` Was a Deep Wrapper for Very Little

`lib/ingestion/save_json/zolo_save_json.ts` — 4 levels deep for what ultimately called `write_json.ts` in utils. The concept of "ingestion" is meaningful (fetch → normalize → persist), but the implementation was just a thin wrapper, not a real pipeline. The folder name promised more architectural weight than existed.

---

## `services/` vs `lib/providers/` Confusion

- `lib/providers/zolo/` — a full-featured provider with endpoints, fetch, helpers, and an index
- `services/zolo_services/zolo_fetch_data.ts` — a simpler version of what looked like the same thing

There was no obvious distinction between what a "provider" was vs what a "service" was. In many architectures these words have specific meanings — a provider fetches external data, a service orchestrates business logic. But here they overlapped completely, meaning every time you opened the project you had to re-decide which one to trust.

---

## What Was Actually Making It Hard

This structure grew organically rather than being designed. Evidence:

- The `types/` folder was empty — a structure was anticipated but not followed through.
- `services/` existed alongside `lib/providers/` with no clear delineation.
- `ingestion/` was one file deep but pretended to be a module.
- The entry point `index.ts` had extensive commented-out code suggesting the architecture had pivoted multiple times.

The cognitive overload came from **vocabulary mismatch**: the folder names (`ingestion`, `providers`, `services`, `json_readers`) implied distinct layers, but the actual code didn't respect those boundaries consistently. When folder names don't reliably predict what's inside them, you stop trusting the structure and start reading every file to orient yourself.

---

## The Fix: Organize Around Pipelines, Not Technical Layers

The new structure reflects the actual mental model — how data flows through the app:

```
Fetch from external API  →  Store to JSON  →  Push to Next.js app
```

```
src/
├── index.ts                    ← just pipeline call-sites
├── pipelines/
│   ├── zolo.ts                 ← owns the full Zolo flow end-to-end
│   └── stanza.ts
├── providers/                  ← raw HTTP only, nothing else
│   ├── zolo/
│   │   ├── api.ts
│   │   └── endpoints.ts
│   └── stanza/
│       ├── api.ts
│       └── endpoints.ts
├── storage/                    ← all JSON read/write, no business logic
│   ├── paths.ts
│   ├── zolo.ts
│   └── stanza.ts
├── push/
│   └── next-api.ts             ← push to Next.js
└── utils/
    ├── clipboard.ts
    ├── read_json.ts
    └── write_json.ts
```

**The key principle: folders should answer "what does this do in my app" — not "what kind of code is this technically."**
