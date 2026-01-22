# Travel Companion

A travel companion website for managing travel checklists with your partner.

## Features

- User authentication
- Checklist templates (Abroad, Day Trip, Overnight)
- Create checklists from templates
- Check off items as you pack
- Track progress on each checklist

## Project Structure

```
travel_companion/
├── frontend/    # React + TypeScript (Vite)
├── backend/     # Node.js + Express + Prisma
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run db:push      # Create database tables
npm run db:seed      # Seed default templates
npm run dev          # Start development server
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # Start development server
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - SQLite database path
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
