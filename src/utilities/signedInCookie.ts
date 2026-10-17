/**
 * Cookie readable by the browser, set next to Payload's HttpOnly `payload-token` cookie while a user
 * is signed in, so the front end only asks `/api/users/me` when the visitor might be signed in.
 */
export const SIGNED_IN_COOKIE = 'payload-signed-in'
