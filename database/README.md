# The Atlas - Development Setup

This is the development workspace for **The Atlas**, a web-based mapping platform built with Next.js, TypeScript, Supabase, and Leaflet.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier works for development)

### Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Visit `http://localhost:3000`

## 🛠️ Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript checks
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## 📁 Project Structure

```
├── pages/                 # Next.js pages
│   ├── api/              # API routes
│   ├── maps/             # Custom map pages
│   ├── dashboard/        # Client dashboard
│   ├── admin/            # Admin panel
│   └── auth/             # Authentication pages
├── components/           # React components
│   ├── maps/            # Map-specific components
│   ├── admin/           # Admin panel components
│   ├── layout/          # Layout components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility libraries
│   ├── supabase/        # Supabase client & helpers
│   └── utils/           # General utilities
├── types/               # TypeScript type definitions
├── styles/              # CSS styles
└── public/              # Static assets
```

## 🧩 VS Code Features

This workspace is configured with:

- **TypeScript** - Full type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - CSS class completion
- **Auto-formatting on save**
- **Pre-commit hooks** with Husky
- **Debug configurations** for Next.js
- **Task runner** for common commands

## 🔧 VS Code Tasks

Access via `Cmd+Shift+P` → "Tasks: Run Task":

- **dev** - Start development server
- **build** - Build project
- **test** - Run tests
- **lint** - Run linter
- **type-check** - Check TypeScript

## 🐛 Debugging

Two debug configurations available:

1. **Next.js: debug server-side** - Debug server-side code
2. **Next.js: debug client-side** - Debug client-side code

## 🎯 Next Steps

1. Set up your Supabase project
2. Configure environment variables
3. Create the database schema (see Project_Overview.md)
4. Start building custom map components

## 📚 Documentation

See `Project_Overview.md` for comprehensive project documentation including:

- Architecture overview
- Database schema
- Component API reference
- Deployment instructions

## 🔒 Security

- TypeScript for type safety
- ESLint for code quality
- Husky for pre-commit validation
- Latest Next.js with security patches
- Supabase RLS for data security
