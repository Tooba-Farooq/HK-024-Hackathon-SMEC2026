This is a [Next.js](https://nextjs.org) project with RBAC (Role-Based Access Control) system using Better Auth.

## Features

- ✅ Email/Password authentication with Better Auth
- ✅ Role-based access control (Admin & User roles)
- ✅ Protected routes with role verification
- ✅ Beautiful login and signup pages with animations
- ✅ Separate dashboards for Admin and User roles
- ✅ Route protection middleware

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
- `users` (Custom users table with roles)
- `session`, `account`, `verification` (Better Auth tables)

### Running the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app/login` - Login page with role selection
- `/src/app/signup` - Signup page with role selection
- `/src/app/dashboard/admin` - Admin dashboard (protected)
- `/src/app/dashboard/user` - User dashboard (protected)
- `/src/lib/rbac.ts` - RBAC utilities and role management
- `/src/lib/route-protection.ts` - Route protection helpers
- `/src/app/api/auth/[...all]` - Better Auth API route handler
- `/src/app/api/user/role` - User role API endpoints

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
