# How to Start the Backend Server

## Quick Start

You need to run the backend server **separately** from the frontend. Here are your options:

### Option 1: Run Both Together (Recommended)
```bash
npm run dev:all
```
This starts both the frontend (port 3000) and backend (port 3001) at the same time.

### Option 2: Run Separately (Two Terminals)

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```
You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3001
📁 Uploads directory: ...
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Prerequisites

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Database:**
   - Make sure you have a `.env` file in the root directory
   - Add your `DATABASE_URL`:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
     ```

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

4. **Push Database Schema:**
   ```bash
   npm run db:push
   ```

## Troubleshooting

### "Cannot connect to server"
- Make sure the backend server is running (check Terminal 1)
- Verify port 3001 is not being used by another application

### "Failed to connect to database"
- Check your `.env` file has the correct `DATABASE_URL`
- Make sure PostgreSQL is running
- Verify the database exists

### Port Already in Use
If port 3001 is already in use, you can change it by setting `PORT` in your `.env`:
```
PORT=3002
```
Then update `vite.config.ts` proxy target to match.

