import type {
  CollectionAfterLoginHook,
  CollectionAfterLogoutHook,
  CollectionAfterRefreshHook,
  PayloadRequest,
} from 'payload'

import { SIGNED_IN_COOKIE } from '../../../utilities/signedInCookie'

// Payload merges `req.responseHeaders` into its REST responses, appending to their own `Set-Cookie`
const setSignedInCookie = (req: PayloadRequest, value: string, maxAge: number) => {
  const cookie = [`${SIGNED_IN_COOKIE}=${value}`, 'Path=/', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (req.protocol === 'https:') cookie.push('Secure')

  req.responseHeaders ??= new Headers()
  req.responseHeaders.append('Set-Cookie', cookie.join('; '))
}

// Also runs on password reset and first user registration, which log the user in
export const setSignedInCookieAfterLogin: CollectionAfterLoginHook = ({ collection, req }) => {
  setSignedInCookie(req, '1', collection.auth.tokenExpiration)
}

export const setSignedInCookieAfterRefresh: CollectionAfterRefreshHook = ({ collection, req }) => {
  setSignedInCookie(req, '1', collection.auth.tokenExpiration)
}

export const expireSignedInCookie: CollectionAfterLogoutHook = ({ req }) => {
  setSignedInCookie(req, '', 0)
}
