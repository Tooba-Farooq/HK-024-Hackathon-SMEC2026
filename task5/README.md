# QR Chat - Instant Connection App

A modern web application built with Next.js that allows users to instantly connect and chat with each other by scanning QR codes, without the need to search usernames or phone numbers.

## Features

- ✅ Email/Password authentication with Better Auth
- ✅ User profiles with QR codes
- ✅ QR code scanning for instant friend connections
- ✅ Real-time one-to-one chat with message history
- ✅ Dark and light mode support
- ✅ Responsive mobile-first design
- ✅ Built with ShadCN UI components

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
```

### Database Setup

1. Run database migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

This will create the necessary tables including:
- `user` (Better Auth user table)
- `profile` (User profiles with QR codes)
- `friendship` (Friend connections)
- `message` (Chat messages)
- `session`, `account`, `verification` (Better Auth tables)

### Running the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app/login` - Login page
- `/src/app/signup` - Signup page
- `/src/app/chat` - Main chat interface
- `/src/app/profile` - User profile page
- `/src/app/api/profile` - Profile API endpoints
- `/src/app/api/friends` - Friends API endpoints
- `/src/app/api/messages` - Messages API endpoints
- `/src/app/api/scan` - QR code scanning API
- `/src/app/api/qr` - QR code generation API
- `/src/components` - React components (chat, QR scanner, etc.)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [ShadCN UI](https://ui.shadcn.com) - UI component library documentation.
