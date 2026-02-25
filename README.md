
  # DocumentTrackingSystem

  This is a code bundle for DocumentTrackingSystem. The original project is available at https://www.figma.com/design/y9OIw1JzauLAJIUtA5tTdV/DocumentTrackingSystem.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Database (Supabase)

  Documents, notifications, and uploads use Supabase. Configure `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, then run **`supabase-schema.sql`** in the Supabase SQL Editor once to create tables and storage. See **SUPABASE_GUIDE.md** for details.

  ## Delete Account (Edge Function)

  The "Delete Account" feature requires:

  1. **Deploy the Edge Function:**
     ```bash
     supabase functions deploy delete-user --no-verify-jwt
     ```

  2. **If you see "Database error deleting user"**:
     - Run **`diagnose-auth-user-delete-blockers.sql`** first to see which constraint blocks deletion.
     - Then run **`fix-storage-objects-fk-for-user-delete.sql`** to fix the storage FK.

  Requires the [Supabase CLI](https://supabase.com/docs/guides/cli) and `supabase login`.
  # DocumentTrackingSystem
