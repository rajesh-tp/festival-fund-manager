# Festival Fund Manager

A web application for managing temple festival funds — track income (donations, contributions) and expenditures (supplies, services) across multiple events with real-time summaries, date-wise reports, and PDF export.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **Database**: SQLite via better-sqlite3
- **ORM**: Drizzle ORM
- **Validation**: Zod v4
- **Styling**: Tailwind CSS v4
- **PDF**: jsPDF + jspdf-autotable
- **Notifications**: Sonner
- **Deployment**: Docker / Fly.io

## Features

- Create and manage multiple temple events (e.g., "Ayyappa Festival 2026")
- Record income and expenditure transactions scoped to each event
- Dashboard with income / expenditure / net total summary cards
- Date-wise transaction reports with type filtering and sorting (date/amount)
- PDF preview and download per event
- Multi-user authentication (cookie-based sessions with SHA-256 hashing)
- Superadmin controls: delete all transactions per event, reset user passwords, delete events
- Fully responsive design (mobile + desktop)

## Default Users

| Username     | Password     | Role        |
|-------------|-------------|-------------|
| admin       | *********   | Admin       |
| superadmin  | *********   | Superadmin  |

## Running with Docker Desktop

### 1. Build the Docker image

```bash
docker build -t festival-fund-manager .
```

### 2. Run the container

```bash
docker run -d --name festival-fund -p 3000:3000 festival-fund-manager
```

The app will be available at **http://localhost:3000**

### 3. Run with persistent data

To keep your database across container restarts, mount a volume:

```bash
docker run -d --name festival-fund -p 3000:3000 -v festival-data:/data festival-fund-manager
```

### 4. Stop the container

```bash
docker stop festival-fund
```

### 5. Start a stopped container

```bash
docker start festival-fund
```

### 6. View logs

```bash
docker logs festival-fund
```

Follow logs in real-time:

```bash
docker logs -f festival-fund
```

### 7. Rebuild and redeploy after code changes

```bash
docker stop festival-fund && docker rm festival-fund
docker build -t festival-fund-manager .
docker run -d --name festival-fund -p 3000:3000 -v festival-data:/data festival-fund-manager
```

### 8. Remove everything (container + data)

```bash
docker stop festival-fund && docker rm festival-fund
docker volume rm festival-data
```

## Local Development

### Prerequisites

- Node.js 22+
- npm

### Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd festival-fund-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run database migrations:

   ```bash
   npm run db:migrate
   ```

4. Seed default users:

   ```bash
   node seed-users.mjs
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable         | Description                           | Required | Default              |
|-----------------|---------------------------------------|----------|----------------------|
| `SESSION_SECRET`| Secret key for signing session tokens | No       | dev fallback         |
| `DATABASE_URL`  | Path to SQLite database file          | No       | `./data/festival.db` |

## Database Commands

| Command              | Description                                  |
|---------------------|----------------------------------------------|
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate`  | Run pending migrations                       |
| `npm run db:studio`   | Open Drizzle Studio for database inspection  |

## Fly.io Deployment

### Prerequisites

- [Fly CLI](https://fly.io/docs/flyctl/install/) installed
- Fly.io account

### First Deployment

1. Launch the app:

   ```bash
   fly launch --no-deploy
   ```

2. Create a persistent volume for the database:

   ```bash
   fly volumes create festival_data --region bom --size 1
   ```

3. Set environment secrets:

   ```bash
   fly secrets set SESSION_SECRET=$(openssl rand -base64 32)
   ```

4. Deploy:

   ```bash
   fly deploy
   ```

5. Open in browser:

   ```bash
   fly open
   ```

### Subsequent Deployments

```bash
fly deploy
```

## Project Structure

```
src/
  app/
    layout.tsx               # Root layout with Navbar, EventSelector, and Toaster
    page.tsx                 # Home page with summary dashboard (scoped to event)
    login/
      page.tsx               # Login page
      _components/
        LoginForm.tsx        # Login form (client component)
    events/
      page.tsx               # Event management page
      _components/
        EventForm.tsx        # Create event form (client component)
        EventList.tsx        # Event list with select/delete (client component)
    entry/
      page.tsx               # Data entry page (scoped to event)
      _components/
        TransactionForm.tsx  # Add/edit form with hidden eventId (client component)
        RecentEntries.tsx    # Recent entries list (server component)
        DeleteButton.tsx     # Delete with confirmation (client component)
        SuperadminPanel.tsx  # Delete all transactions, reset passwords (client component)
    reports/
      page.tsx               # Reports page with date grouping (scoped to event)
      _components/
        ReportFilters.tsx    # Type filter + sort dropdown
        DateGroup.tsx        # Date-grouped transaction view
        AmountSortedList.tsx # Amount-sorted flat list view
        SummaryBar.tsx       # Income/expenditure/net summary bar
        DownloadPdfButton.tsx # PDF preview and download
  components/
    Navbar.tsx               # Navigation bar with event selector
    EventSelector.tsx        # Event dropdown (client component)
    SummaryCard.tsx          # Reusable summary card
  db/
    schema.ts                # Drizzle schema (events, transactions, users)
  lib/
    actions.ts               # Server actions (event CRUD, transaction CRUD, auth)
    auth.ts                  # Session management helpers
    db.ts                    # Database connection
    queries.ts               # Read queries (all scoped by eventId)
    utils.ts                 # Date formatting and currency utilities
    validators.ts            # Zod schemas (event, transaction)
  proxy.ts                   # Route protection middleware
```
