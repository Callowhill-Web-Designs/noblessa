# Auth0 Authentication Setup

This document explains how to set up and use the Auth0 authentication system for the Noblessa website.

## Features Implemented

1. **Login Page** (`/login/`)
   - Clean, professional login interface
   - Auth0 integration for secure authentication
   - Error handling and user feedback

2. **Protected Pages**
   - **Partner Resources** (`/partner-resources/`) - Exclusive resources for authenticated partners
   - **Partner Directory** (`/partner-directory/`) - Directory of other partners

3. **Server-Side Authentication**
   - JWT token-based sessions
   - Secure cookie storage
   - Auth state verification

## Setup Instructions

### 1. Auth0 Configuration

Your Auth0 application is already configured with the credentials in `.env`:

```
AUTH0_DOMAIN=callowhillwebdesigns.us.auth0.com
AUTH0_CLIENT_ID=zbsdhVuEwLxNyxCWKUItVyCxQFKbOQlZ
AUTH0_CLIENT_SECRET=SDdIady7MmM9zZiZMYopMDDfbOR5IG56sFzj-ZdBlRYgvgv-uj65stvy8_IecdTR
AUTH0_ORGANIZATION_ID=org_lhjiEFCGGg40D4ay
```

### 2. Auth0 Application Settings

In your Auth0 dashboard, ensure these settings:

**Allowed Callback URLs:**
```
http://localhost:8888/.netlify/functions/auth-callback
https://your-domain.netlify.app/.netlify/functions/auth-callback
```

**Allowed Logout URLs:**
```
http://localhost:8888/
https://your-domain.netlify.app/
```

**Allowed Web Origins:**
```
http://localhost:8888
https://your-domain.netlify.app
```

### 3. Environment Variables for Deployment

When deploying to Netlify, add these environment variables in your Netlify dashboard:

- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_ORGANIZATION_ID`
- `URL` (your site's URL, e.g., `https://your-domain.netlify.app`)

## How It Works

### Authentication Flow

1. User clicks "Login" → Redirected to `/.netlify/functions/auth-login`
2. Function redirects to Auth0 login page
3. User authenticates with Auth0
4. Auth0 redirects to `/.netlify/functions/auth-callback` with authorization code
5. Callback function exchanges code for user info and creates JWT session token
6. User is redirected to `/partner-resources/` with secure cookie set

### Protected Route Access

1. JavaScript checks authentication status on page load
2. If not authenticated and on protected page → Redirect to login
3. If authenticated → Show protected content, hide login prompts
4. Session verified server-side using JWT tokens

### Logout Process

1. User clicks "Logout" → Call to `/.netlify/functions/auth-logout`
2. Function clears authentication cookie
3. User redirected to home page

## Files Created/Modified

### Netlify Functions
- `netlify/functions/auth-login.js` - Initiates Auth0 login
- `netlify/functions/auth-callback.js` - Handles Auth0 callback
- `netlify/functions/auth-verify.js` - Verifies user authentication
- `netlify/functions/auth-logout.js` - Handles user logout

### Pages
- `src/login.html` - Login page with Auth0 integration
- `src/partner-resources.html` - Protected partner resources page
- `src/partner-directory.html` - Protected partner directory page

### Assets
- `src/assets/js/auth.js` - Client-side authentication management
- `src/assets/css/login.css` - Styles for authentication pages
- `src/assets/svgs/` - Icon files for partner resources

### Configuration
- `netlify.toml` - Updated with functions configuration
- `src/_includes/layouts/base.html` - Added auth script
- `src/_includes/sections/header.html` - Added user info area
- `src/assets/less/root.less` - Added authentication styles

## Security Features

- **Server-side token verification** - All auth checks happen server-side
- **HTTP-only cookies** - Tokens stored in secure, HTTP-only cookies
- **JWT expiration** - Tokens expire after 7 days
- **CSRF protection** - SameSite cookie settings
- **Secure transmission** - All authentication over HTTPS in production

## Testing

### Local Development
1. Run `npm run start`
2. Visit `http://localhost:8080/partner-resources/`
3. Should redirect to login page
4. Click "Login with Auth0" to test authentication flow

### Production Testing
1. Deploy to Netlify
2. Update Auth0 callback URLs with your domain
3. Test authentication flow on live site

## Customization

### Adding New Protected Pages
1. Create new page with protected content wrapped in `<div class="protected-content">`
2. Add login prompt with `<div class="login-prompt">`
3. Add page path to `protectedPages` array in `auth.js`

### Styling
- Modify `src/assets/css/login.css` for authentication page styles
- Update `src/assets/less/root.less` for header user info styles

## Troubleshooting

### Common Issues
1. **CORS Errors** - Check Auth0 allowed origins
2. **Callback Errors** - Verify callback URLs in Auth0 dashboard
3. **Token Issues** - Check environment variables are set correctly
4. **Redirect Loops** - Ensure proper error handling in auth functions

### Debug Mode
Add `console.log` statements in auth functions to debug authentication flow.
