import { auth } from './auth';
import { headers } from 'next/headers';

/**
 * Get the current session on the server side
 * Returns null if no session exists
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * Get the current user on the server side
 * Returns null if no user is authenticated
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}
