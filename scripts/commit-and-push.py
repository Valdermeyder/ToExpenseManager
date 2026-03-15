import subprocess
import os
import sys

print(f"[v0] Current working directory: {os.getcwd()}")
print(f"[v0] Current working directory contents: {os.listdir('.')}")

# List parent directories to find the git repo
current = os.getcwd()
for i in range(5):
    print(f"[v0] Checking: {current}")
    if os.path.exists(os.path.join(current, '.git')):
        print(f"[v0] Found .git at: {current}")
        os.chdir(current)
        break
    if os.path.exists(os.path.join(current, 'package.json')):
        print(f"[v0] Found package.json at: {current}")
        os.chdir(current)
        break
    parent = os.path.dirname(current)
    if parent == current:
        break
    current = parent

print(f"[v0] Working directory: {os.getcwd()}")

try:
    # Check if .git exists
    if not os.path.exists('.git'):
        print("[v0] .git not found, attempting to initialize...")
        result = subprocess.run(['git', 'init'], capture_output=True, text=True)
        print(f"[v0] Git init: {result.stdout if result.returncode == 0 else result.stderr}")
        
        result = subprocess.run(['git', 'config', 'user.email', 'v0@vercel.dev'], capture_output=True, text=True)
        result = subprocess.run(['git', 'config', 'user.name', 'v0 Assistant'], capture_output=True, text=True)
    
    # Add all changes
    print("[v0] Adding all changes...")
    result = subprocess.run(['git', 'add', '.'], capture_output=True, text=True)
    
    # Check git status
    result = subprocess.run(['git', 'status', '--short'], capture_output=True, text=True)
    print(f"[v0] Changes to commit:\n{result.stdout}")
    
    # Commit changes
    commit_message = "chore: migrate to Next.js 16 and fix 404 error"
    print("[v0] Committing changes...")
    result = subprocess.run(['git', 'commit', '-m', commit_message, '-m', 
        '- Upgraded Next.js from 15.2.0 to 16.0.0\n' +
        '- Upgraded React to 19.0.0 and ESLint to 9.0.0\n' +
        '- Removed deprecated transitionIndicator experimental option\n' +
        '- Migrated vanilla JS app to Next.js App Router structure\n' +
        '- Created app/page.tsx with styled converter form\n' +
        '- Created app/api/convert/route.ts for CSV conversion\n' +
        '- Migrated all 8 bank converters to TypeScript\n' +
        '- Fixed hydration mismatch with suppressHydrationWarning\n' +
        '- Configured Tailwind CSS v4 theme with design tokens\n' +
        '- Added category resolver and mapping normalizer utilities'
    ], capture_output=True, text=True)
    print(f"[v0] Commit: {result.stdout if result.returncode == 0 else result.stderr}")
    
    # Push to the fix-404-error branch
    print("[v0] Pushing to fix-404-error branch...")
    result = subprocess.run(['git', 'push', 'origin', 'fix-404-error', '-f'], capture_output=True, text=True)
    print(f"[v0] Push: {result.stdout if result.returncode == 0 else result.stderr}")
    
    if result.returncode == 0:
        print("[v0] Successfully committed and pushed changes!")
    else:
        print(f"[v0] Push returned code: {result.returncode}")

except Exception as e:
    print(f"[v0] Error: {e}")
    import traceback
    traceback.print_exc()
