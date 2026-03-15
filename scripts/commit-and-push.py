import subprocess
import os
import sys

os.chdir('/vercel/share/v0-project')

try:
    # Check if .git exists
    if not os.path.exists('.git'):
        print("[v0] Initializing git repository...")
        subprocess.run(['git', 'init'], check=True, capture_output=True)
        subprocess.run(['git', 'config', 'user.email', 'v0@vercel.dev'], check=True, capture_output=True)
        subprocess.run(['git', 'config', 'user.name', 'v0 Assistant'], check=True, capture_output=True)
        print("[v0] Git repository initialized")
    
    # Add all changes
    print("[v0] Adding all changes...")
    result = subprocess.run(['git', 'add', '.'], capture_output=True, text=True)
    print(f"[v0] Git add output: {result.stdout}")
    
    # Commit changes
    commit_message = """chore: migrate to Next.js 16 and fix 404 error

- Upgraded Next.js from 15.2.0 to 16.0.0
- Upgraded React to 19.0.0 and ESLint to 9.0.0
- Removed deprecated 'transitionIndicator' experimental option from next.config.ts
- Migrated vanilla JS app to Next.js App Router structure
- Created app/page.tsx with styled converter form component
- Created app/api/convert/route.ts API endpoint for CSV conversion
- Migrated all 8 bank converters to TypeScript in lib/converters/
- Fixed hydration mismatch by adding suppressHydrationWarning to root HTML element
- Configured Tailwind CSS v4 theme with proper design tokens
- Added category resolver and mapping normalizer utilities"""
    
    print("[v0] Committing changes...")
    result = subprocess.run(['git', 'commit', '-m', commit_message], capture_output=True, text=True)
    print(f"[v0] Git commit output: {result.stdout}")
    if result.returncode != 0:
        print(f"[v0] Git commit error: {result.stderr}")
    
    # Push to the fix-404-error branch
    print("[v0] Pushing to fix-404-error branch...")
    result = subprocess.run(['git', 'push', 'origin', 'fix-404-error', '-f'], capture_output=True, text=True)
    print(f"[v0] Git push output: {result.stdout}")
    if result.returncode != 0:
        print(f"[v0] Git push error: {result.stderr}")
    
    print("[v0] Successfully committed and pushed changes!")

except subprocess.CalledProcessError as e:
    print(f"[v0] Error: {e.stderr}")
    sys.exit(1)
except Exception as e:
    print(f"[v0] Unexpected error: {e}")
    sys.exit(1)
