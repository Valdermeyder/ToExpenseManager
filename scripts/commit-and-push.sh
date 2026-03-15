#!/bin/bash
set -e

# Configure git
git config --global user.email "v0@vercel.dev"
git config --global user.name "v0 AI Assistant"

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
  git init
  git remote add origin https://github.com/Valdermeyder/ToExpenseManager.git
fi

# Fetch the latest changes from the remote
git fetch origin nextjs-application-conversion || true

# Checkout the correct branch
git checkout -b fix-404-error origin/nextjs-application-conversion 2>/dev/null || git checkout fix-404-error

# Add all changes
git add -A

# Commit changes
git commit -m "Migrate to Next.js 16 and fix 404 error

- Upgraded Next.js from 15.2.0 to 16.0.0
- Updated React and other dependencies
- Migrated index.html, app.js, and main.js to Next.js App Router
- Created app/page.tsx with styled CSV converter form
- Created app/api/convert/route.ts for server-side file conversion
- Migrated all 8 bank converters (City, PKO, Nest, Santander, Pekao, Monobank, Velobank, Revolut) to TypeScript
- Added Tailwind CSS v4 theme configuration with proper design tokens
- Fixed hydration mismatch with suppressHydrationWarning on root HTML element
- Removed deprecated transitionIndicator experimental config option" || echo "No changes to commit"

# Push changes to the remote branch
git push origin fix-404-error

echo "✓ Changes committed and pushed successfully!"
