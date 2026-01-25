# Clerk Webhook Setup Guide

## Environment Variables Required

You must set these environment variables in your `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
CLERK_WEBHOOK_SECRET=your_webhook_secret_here

# MongoDB
DATABASE_URL=your_mongodb_connection_string_here
```

## How to Get These Values

### 1. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** and **CLERK_SECRET_KEY**

- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Select your application
- Navigate to "API Keys"
- Copy your Publishable Key and Secret Key

### 2. **CLERK_WEBHOOK_SECRET**

This is the most critical for webhook verification:

1. In Clerk Dashboard, go to **Webhooks** section
2. Click **Create Endpoint** or edit an existing one
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/clerk`
4. For local development, use: `http://localhost:3000/api/webhooks/clerk`
5. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the **Signing Secret** value - this is your `CLERK_WEBHOOK_SECRET`

### 3. **DATABASE_URL**

- Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`
- Get this from your MongoDB Atlas connection string

## Testing Webhooks Locally

You have two options:

### Option A: Using Clerk Dashboard Test Event (Recommended for testing)

1. In Clerk Webhooks section, click your endpoint
2. Use the "Test Endpoint" feature to send test events
3. Check your app logs to verify processing

### Option B: Using Ngrok (For real webhook testing)

1. Install [ngrok](https://ngrok.com/download)
2. Run: `ngrok http 3000`
3. Copy the provided URL (e.g., `https://abc123.ngrok.io`)
4. Update your Clerk webhook endpoint to: `https://abc123.ngrok.io/api/webhooks/clerk`
5. Run your app: `npm run dev`
6. Clerk will send real webhooks to your local app

## Webhook Flow Diagram

```
User Sign-Up/Update/Delete in Clerk Dashboard
         ↓
Clerk sends webhook request with signature
         ↓
POST /api/webhooks/clerk
         ↓
verifyWebhook() validates signature
         ↓
Extract event type & user data
         ↓
Sync with MongoDB (upsert or delete)
         ↓
Return { success: true }
```

## What Happens on Each Event

### user.created

- Creates new user document in MongoDB
- Initializes empty cart
- Stores: clerkId, email, name, image, timestamps

### user.updated

- Updates existing user document
- Preserves cart and other user data
- Updates timestamps

### user.deleted

- Removes user document from MongoDB
- Logs deletion confirmation

## Debugging Webhooks

### Enable Logging

The webhook handler includes console.log statements for debugging:

```typescript
console.log(`User created successfully: ${data.id}`);
console.log(`Webhook processing failed:`, err);
```

Check your server logs when webhooks are processed.

### Common Issues

| Issue                                 | Solution                                      |
| ------------------------------------- | --------------------------------------------- |
| `CLERK_WEBHOOK_SECRET is not set`     | Add `CLERK_WEBHOOK_SECRET` to `.env.local`    |
| `Webhook verification failed`         | Check that the signing secret matches exactly |
| `Email is required for user creation` | Ensure user has an email in Clerk             |
| `User not found for deletion`         | User may have already been deleted            |

## Database Initialization

When the first user webhook arrives:

1. MongoDB collection 'users' is created automatically
2. Initial document structure includes cart object
3. Indexes are created for clerkId (unique), email, and timestamps

## User Document Schema

```typescript
{
  _id: ObjectId,
  clerkId: string,           // Unique identifier from Clerk
  email: string,             // Primary identifier
  name: string,              // Full name
  image: string,             // Profile image URL
  cart: {                    // Shopping cart
    [productId]: {
      productId: string,
      quantity: number,
      price: number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Validation & Error Handling

The webhook endpoint now includes:

- ✅ Signature verification (MUST match webhook secret)
- ✅ Email validation (required for user creation)
- ✅ Clerk ID validation (required for all operations)
- ✅ Deletion confirmation (logs if user exists)
- ✅ Proper HTTP status codes (401 for auth, 400 for validation, 500 for server)

## Available User Methods

```typescript
import { db } from '@/lib/models';

// Retrieve users
await db.getUserByClerkId(clerkId);
await db.getUserById(mongoId);
await db.getUserByEmail(email);

// Manage users
await db.upsertUser(clerkId, userData);
await db.deleteUserByClerkId(clerkId);
```

## Production Checklist

- [ ] Set `CLERK_WEBHOOK_SECRET` in production environment
- [ ] Update Clerk webhook endpoint to your production domain
- [ ] Configure MongoDB Atlas IP whitelist for your server
- [ ] Enable monitoring/alerts for webhook failures
- [ ] Test user creation, update, and deletion workflows
- [ ] Verify MongoDB collections are created and indexed
