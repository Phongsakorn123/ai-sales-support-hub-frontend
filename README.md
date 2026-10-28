# AI Sales Support Hub — Frontend

Next.js web application for sales staff to search the product catalog, review AI-assisted product suggestions, manage products, and view catalog analytics. The frontend calls the FastAPI backend through same-origin route handlers and displays product images through an image proxy.

## Features

- Account registration, login, logout, and protected dashboard routes. Access tokens are stored by the browser client and forwarded by protected API helpers.
- Quick natural-language and detailed-criteria product search. Results show exact matches, alternatives, requirement checks, retrieval mode, and whether ranking came from the AI model or deterministic catalog fallback.
- Product catalog management: browse, filter, inspect, create, update, and delete products.
- Product image proxy for backend-hosted images.
- Analytics calculated from the product catalog.
- Voice input where supported by the browser and microphone permissions.

Search depends on backend configuration. If OpenRouter is unavailable, the API can return catalog-matched results without AI ranking. `retrieval_mode: hybrid` means keyword and local embedding retrieval were both used; `keyword_fallback` means semantic retrieval was unavailable. Supporting documents included with the demo catalog are marked as mock data.

## Source organization

The `src/app` directory contains Next.js pages and route handlers. Feature code is grouped by responsibility:

```text
src/
├── app/                         # Next.js pages and backend proxy routes
├── di/                          # Dependency composition root and provider
├── features/
│   ├── auth/                    # Login, registration, session, and auth UI
│   ├── dashboard/               # Dashboard state, tabs, and analytics UI
│   ├── products/                # Product model, API adapter, and management UI
│   └── search/                  # Search rules, API adapter, and result UI
└── lib/api/                     # Shared protected-fetch transport
```

Each feature uses `domain/`, `application/`, `infrastructure/`, and `presentation/` folders.

Each feature follows the same dependency direction:

```text
Presentation component → ViewModel → Use case → Repository interface
                                             ↓
                                  Repository implementation → Service
```

`domain` owns entities, rules, and repository interfaces. `application` contains use cases. `infrastructure` implements repositories and services. `presentation/components` renders UI, while `presentation/view-models` owns screen state and coordinates use cases. `src/di/app-dependencies.ts` is the composition root: it wires service → repository → use case, and `DependencyProvider` injects those use cases into ViewModels. Next.js route handlers stay in `src/app/api` and forward requests to the backend.

For example, product changes flow through `dashboard-view-model` → `ProductUseCases` → `ProductRepository` interface → `ProductApiRepository` → `ProductApi` interface → `ProductApiService`. The composition root constructs the concrete adapters; a test or alternate runtime can inject different `AppDependencies` through `DependencyProvider`.

## Run locally

Requirements: Node.js and npm. From this repository:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Start the backend separately and set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_AI_AGENT_API_URL` in `.env.local` to its API root, such as `http://localhost:8002/api/v1` when using the backend Compose setup. These variables are server-side routing configuration despite the `NEXT_PUBLIC_` prefix; do not put credentials in them.

## Run both services with Docker Compose

The Compose file is in the sibling backend repository. Clone both repositories into sibling directories, then run from the backend directory:

```bash
docker compose up --build -d
```

The frontend is available at <http://localhost:3001>, and the backend at <http://localhost:8002>. Compose configures the frontend to reach the backend at `http://backend:8000/api/v1` on the private Docker network.

On first startup, Compose initializes the database, catalog, supporting demo documents, and local hybrid-search embeddings automatically. OpenRouter credentials are optional for startup; without a key AI search shows catalog-matched fallback results instead of AI-ranked results. To enable AI ranking, set only `OPENROUTER_API_KEY` in the backend `.env`; Compose selects the default free model. See the backend README for details.

## Environment variables

| Variable                       | Purpose                                                          | Local default                                    |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`     | Base URL used by frontend server routes for the backend REST API | `http://localhost:8000/api/v1` in `.env.example` |
| `NEXT_PUBLIC_AI_AGENT_API_URL` | AI API base URL used by the AI suggestion route                  | `http://localhost:8001/api/v1` in `.env.example` |

For direct local development, set both to the backend host URL (normally `http://localhost:8002/api/v1` with the supplied backend Compose mapping). In Compose, both are set to `http://backend:8000/api/v1`. Never expose backend secrets in frontend environment variables.

## Quality checks

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

The unit suite covers product-suggestion request/response handling and fallback parsing. The Playwright E2E suite covers registration and login flows using mocked authentication API responses; it does not exercise a live backend. E2E starts the production server on `127.0.0.1:3123` by default.

## CI and security workflows

GitHub Actions in this repository run frontend tests and security scans. The security workflow includes Semgrep, Trivy dependency scanning, and IaC scanning. The backend repository contains its own backend test and DAST workflows. Review workflow files for their exact triggers and scan scope.

## Main routes and dashboard navigation

- `/login` and `/register`: account access.
- `/?tab=search`: product search (also the default `/` route).
- `/?tab=products`: catalog management.
- `/?tab=analytics`: catalog analytics.

Route paths are defined in `src/navigation/app-routes.ts`. Dashboard labels, icons, and destinations are defined in `src/features/dashboard/presentation/navigation/dashboard-navigation-items.ts`; the navigation UI is in `dashboard-navigation.tsx`.

The analytics view is part of the dashboard navigation. Search history persistence and downloadable search-result export are not implemented.
