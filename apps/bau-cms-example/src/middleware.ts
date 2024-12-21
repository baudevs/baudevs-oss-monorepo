import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { i18n } from '@/config/i18n.config';
import { NextRequest, NextResponse } from 'next/server';

// Define the locales and default locale
const locales = i18n.locales;
const defaultLocale = i18n.defaultLocale;

// Define the protected route pattern
const isAdminRoute = createRouteMatcher(['/admin(.*)','/:locale/admin(.*)']);

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export default clerkMiddleware(async (auth, req) => {

  

  console.log('🚀 Middleware Start:', {
    url: req.url,
    pathname: req.nextUrl.pathname,
    method: req.method,
  });

  
  try {
    // Check for admin route and enforce RBAC
    if (isAdminRoute(req)) {
      console.log('📍 Admin Route Detected');
      
      const { userId, sessionClaims } = await auth();
      console.log('🔑 Auth Info:', {
        userId,
        sessionClaimsKeys: sessionClaims ? Object.keys(sessionClaims) : null,
        permissions: sessionClaims?.org_permissions,
        metadata: sessionClaims?.["user.public_metadata"],
      });
      const metadata = sessionClaims?.["user.public_metadata"];
      const isAdmin = (metadata as unknown as { admin: boolean })?.admin;
      console.log("🔑 Admin metadata:", metadata);
      console.log("🔑 Admin isAdmin:", isAdmin);

      // Check if user is logged in and has the required role
      if (!userId) {
        console.log('❌ No User ID found');
        return NextResponse.redirect(new URL('/', req.url));
      }

      if (!isAdmin) {
        console.log('❌ Missing admin permission', {
          availablePermissions: sessionClaims?.org_permissions,
        });
        return NextResponse.redirect(new URL('/', req.url));
      }

      console.log('✅ Admin access granted');
    }

    // Handle locale detection and routing
    console.log('🌐 Processing i18n routing');
    const response = await intlMiddleware(req as unknown as NextRequest);
    console.log('✅ i18n routing complete');
    
    return response;
  } catch (error) {
    console.error('❌ Middleware Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};