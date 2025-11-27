Google OAuth setup
------------------

To enable Google OAuth for local development:

- Set these environment variables in your dev environment or hosting platform:
  - `GOOGLE_CLIENT_ID` — Google OAuth client ID
  - `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
  - `NEXT_PUBLIC_APP_URL` — public URL of your app (e.g. `http://localhost:3000`)
  - (optional) `GOOGLE_REDIRECT_URI` — defaults to `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

- In Google Cloud Console, configure the OAuth consent screen and add the authorized redirect URI matching the redirect above.

- Routes added: `/api/auth/google` (starts OAuth) and `/api/auth/google/callback` (handles callback).
  The callback now sets an HttpOnly `manageable_session` cookie and redirects to `/home`.
- A session endpoint is available at `/api/auth/session` which the frontend calls to read the current logged-in user from the HttpOnly cookie.

Notes
- The implementation exchanges the authorization code server-side and sets a HttpOnly cookie containing minimal user info (email, name). The frontend calls `/api/auth/session` to read the user and persist it to `localStorage`. For backwards compatibility the frontend still supports query param flow.
