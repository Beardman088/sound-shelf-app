# Troubleshooting: "Failed to save" Error

If you're getting a "Failed to save" error when trying to save audio to the database, follow these steps:

## 1. Check if the Backend Server is Running

Make sure the Express server is running on port 3001:

```bash
npm run dev:server
```

You should see: `Server running on http://localhost:3001`

## 2. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for error messages. Look for:
- Network errors
- API URL being used
- Server response details

## 3. Check Server Console

Check the terminal where the server is running for:
- Request logs showing the incoming request
- Error messages from Prisma
- Database connection issues

## 4. Verify Database Connection

Make sure your `.env` file has the correct `DATABASE_URL`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
```

## 5. Common Issues

### Issue: "Cannot connect to server"
**Solution**: Make sure the backend server is running on port 3001

### Issue: "Missing required fields"
**Solution**: Check server logs to see what fields are being received

### Issue: Database connection error
**Solution**: 
- Verify DATABASE_URL is correct
- Make sure PostgreSQL is running
- Run `npm run db:push` to ensure database schema is up to date

### Issue: File upload fails
**Solution**: 
- Check if `uploads/audio` directory exists (it should be created automatically)
- Verify file size is under 50MB
- Check file type is audio

## 6. Test the API Directly

You can test the API endpoint directly using curl:

```bash
curl -X POST http://localhost:3001/api/audio \
  -F "file=@/path/to/your/audio.mp3" \
  -F "name=Test Track" \
  -F "artist=Test Artist" \
  -F "duration=120" \
  -F "userId=test-user-123"
```

## 7. Check Network Tab

In browser DevTools, go to Network tab and:
1. Try saving a track
2. Look for the `/api/audio` request
3. Check the request/response details
4. See if there's a CORS error or 404/500 error

