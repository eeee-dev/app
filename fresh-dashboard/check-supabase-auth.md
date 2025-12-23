# Supabase Authentication Configuration Required

Your login/signup is not working because Supabase needs to be configured with the correct redirect URLs.

## Steps to Fix:

1. Go to Supabase Dashboard:
   https://supabase.com/dashboard/project/bxsylvytnnpbbneyhkcs/auth/url-configuration

2. Add these URLs to "Site URL" and "Redirect URLs":
   - https://office.eeee.mu
   - https://office.eeee.mu/**

3. In "Authentication" → "Providers" → "Email":
   - Enable "Email" provider
   - Enable "Confirm email" (or disable if you want instant access)
   - Save changes

4. In "Authentication" → "URL Configuration":
   - Site URL: https://office.eeee.mu
   - Redirect URLs: https://office.eeee.mu/**

## Current Configuration:
- Supabase URL: https://bxsylvytnnpbbneyhkcs.supabase.co
- Project Ref: bxsylvytnnpbbneyhkcs
- Application URL: https://office.eeee.mu

After making these changes, the login/signup should work immediately (no redeployment needed).
