# Festival Fund Manager

A web application for managing temple/church festival funds — tracking income (donations, contributions) and expenditures (supplies, services) with real-time summaries and date-wise reports.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **Database**: SQLite via better-sqlite3
- **ORM**: Drizzle ORM
- **Validation**: Zod v4
- **Styling**: Tailwind CSS v4
- **Notifications**: Sonner
- **Deployment**: Fly.io (Docker)

## Features

- Dashboard with income / expenditure / net total summary cards
- Transaction entry form for income and expenditure
- Date-wise transaction reports with type filtering
- Edit and delete existing transactions
- Single admin authentication (cookie-based sessions)
- Fully responsive design (mobile + desktop)

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

3. Create a `.env.local` file:

   ```env
   ADMIN_USER=admin
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=your-random-secret-key-at-least-32-chars
   ```

4. Run database migrations:

   ```bash
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Default Credentials

If no `.env.local` is set, the default login is `admin` / `admin`.

## Environment Variables

| Variable         | Description                           | Required | Default              |
|-----------------|---------------------------------------|----------|----------------------|
| `ADMIN_USER`    | Admin login username                  | No       | `admin`              |
| `ADMIN_PASSWORD`| Admin login password                  | No       | `admin`              |
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
   fly volumes create festival_data --region sin --size 1
   ```

3. Set environment secrets:

   ```bash
   fly secrets set ADMIN_USER=admin ADMIN_PASSWORD=your-secure-password SESSION_SECRET=$(openssl rand -base64 32)
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
    layout.tsx               # Root layout with Navbar and Toaster
    page.tsx                 # Home page with summary dashboard
    login/
      page.tsx               # Login page
      _components/
        LoginForm.tsx        # Login form (client component)
    entry/
      page.tsx               # Data entry page (protected)
      _components/
        TransactionForm.tsx  # Add/edit form (client component)
        RecentEntries.tsx    # Recent entries list (server component)
        DeleteButton.tsx     # Delete with confirmation (client component)
    reports/
      page.tsx               # Reports page with date grouping
      _components/
        ReportFilters.tsx
        DateGroup.tsx
        SummaryBar.tsx
  components/
    Navbar.tsx               # Navigation bar with auth state
    SummaryCard.tsx          # Reusable summary card
  db/
    schema.ts                # Drizzle schema definition
  lib/
    actions.ts               # Server actions (CRUD + auth)
    auth.ts                  # Session management helpers
    db.ts                    # Database connection
    queries.ts               # Read queries
    utils.ts                 # Formatting utilities
    validators.ts            # Zod schemas
  proxy.ts                  # Route protection for /entry
```
