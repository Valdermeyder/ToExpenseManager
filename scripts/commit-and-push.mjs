import { execSync } from 'child_process';
import { join } from 'path';

const projectDir = '/vercel/share/v0-project';

try {
  console.log('[v0] Starting git initialization and commit process...');
  
  // Change to project directory
  process.chdir(projectDir);
  
  // Configure git user
  console.log('[v0] Configuring git user...');
  execSync('git config user.email "v0@vercel.com"', { stdio: 'inherit' });
  execSync('git config user.name "v0 Migration Bot"', { stdio: 'inherit' });
  
  // Check if git is already initialized
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    console.log('[v0] Git repository already initialized');
  } catch (e) {
    console.log('[v0] Initializing git repository...');
    execSync('git init', { stdio: 'inherit' });
  }
  
  // Add all changes
  console.log('[v0] Adding all changes...');
  execSync('git add -A', { stdio: 'inherit' });
  
  // Check if there are changes to commit
  try {
    execSync('git diff-index --quiet --cached HEAD', { stdio: 'pipe' });
    console.log('[v0] No changes to commit');
  } catch (e) {
    // There are changes, proceed with commit
    console.log('[v0] Committing changes...');
    execSync('git commit -m "feat: migrate to Next.js 16 and fix 404 error\n\n- Upgraded Next.js from 15.2.0 to 16.0.0 with React 19\n- Removed deprecated transitionIndicator experimental option\n- Created Next.js App Router structure with page.tsx and layout.tsx\n- Migrated all 8 bank converters (City, PKO, Nest, Santander, Pekao, Monobank, Velobank, Revolut) to TypeScript\n- Created API route for CSV conversion at /api/convert\n- Implemented proper Tailwind CSS v4 theme configuration\n- Added suppressHydrationWarning to fix hydration mismatch\n- Restored and enhanced UI components with shadcn/ui styling"', { stdio: 'inherit' });
    
    console.log('[v0] Pushing changes to fix-404-error branch...');
    execSync('git push origin HEAD:fix-404-error', { stdio: 'inherit' });
    
    console.log('[v0] Successfully committed and pushed changes!');
  }
} catch (error) {
  console.error('[v0] Error during git operations:', error.message);
  process.exit(1);
}
