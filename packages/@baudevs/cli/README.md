# BauCMS CLI

The official command-line interface for BauCMS - The opinionated CMS for Next.js.

## Installation

```bash
npm install -g @baudevs/bau-cms-cli
# or
yarn global add @baudevs/bau-cms-cli
# or
pnpm add -g @baudevs/bau-cms-cli
# or
bun add -g @baudevs/bau-cms-cli
```

## Commands

### Initialize BauCMS

```bash
bau init [options]
```

Options:

- `-y, --yes`: Skip prompts and use default values
- `-d, --dir <directory>`: Target directory (defaults to current directory)

Initializes BauCMS in your Next.js project. This will:

- Analyze your project structure
- Set up the database (SQLite or Turso)
- Configure authentication (Clerk)
- Set up the admin UI
- Add content templates
- Configure internationalization

### Database Management

```bash
bau migrate [options]
```

Options:

- `--dry-run`: Show migration plan without executing
- `--reset`: Reset the database and rerun all migrations

### Restore Project

```bash
bau restore [options]
```

Options:

- `--force`: Skip confirmation prompt

Restores your project to its state before BauCMS installation.

### Development Server

```bash
bau dev [options]
```

Options:

- `-p, --port <port>`: Port to run the server on (default: 3000)

Starts a development server with hot reload and admin UI.

### Template Management

```bash
bau templates list
bau templates create
```

Manage BauCMS templates and content types.

### Deployment

```bash
bau deploy [options]
```

Options:

- `--platform <platform>`: Deploy to specific platform (vercel, netlify, etc.)

## Global Options

Available for all commands:

- `--debug`: Enable debug mode
- `--json`: Output as JSON

## Project Structure

BauCMS follows an opinionated structure:

\`\`\`
your-nextjs-project/
├── src/                    # Source directory (recommended)
│   ├── app/               # Next.js App Router
│   │   ├── admin/        # Admin UI pages
│   │   └── api/baucms/   # BauCMS API routes
│   └── middleware.ts      # Auth middleware
├── content.db             # Local SQLite database (if chosen)
└── .baucms-backup/       # Backup of modified files
\`\`\`

## Features

- 🔒 Authentication with Clerk (more providers coming soon)
- 💾 Database options:
  - Local SQLite for development
  - Turso for production
- 📝 Content Templates:
  - Pages
  - Blog Posts (with automatic routing)
  - Services
  - Products
- 🌐 Internationalization support:
  - next-intl
  - next-i18next
- 🎨 Beautiful admin UI
- 🔄 Automatic backup system
- 🚀 Zero-config deployment

## Requirements

- Node.js 18.17 or later
- Next.js 14 or later (using App Router)
- TypeScript (recommended)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT
