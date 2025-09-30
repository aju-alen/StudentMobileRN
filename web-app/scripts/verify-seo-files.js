#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const publicDir = './public';
const distDir = './dist';

// List of SEO files that should be copied
const seoFiles = [
  'robots.txt',
  'sitemap.xml',
  'sitemap-index.xml',
  'keywords.txt',
  'manifest.json',
  'browserconfig.xml'
];

console.log('🔍 Verifying SEO files in dist folder...\n');

// Check if dist folder exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

let allFilesPresent = true;

// Check each SEO file
seoFiles.forEach(file => {
  const publicPath = path.join(publicDir, file);
  const distPath = path.join(distDir, file);
  
  if (fs.existsSync(publicPath)) {
    if (fs.existsSync(distPath)) {
      console.log(`✅ ${file} - Copied successfully`);
    } else {
      console.log(`❌ ${file} - Missing in dist folder`);
      allFilesPresent = false;
    }
  } else {
    console.log(`⚠️  ${file} - Not found in public folder`);
  }
});

console.log('\n📊 Summary:');
if (allFilesPresent) {
  console.log('🎉 All SEO files are properly copied to dist folder!');
  console.log('🚀 Ready for deployment to Render.');
} else {
  console.log('⚠️  Some SEO files are missing. Please check the build process.');
  process.exit(1);
}

// Additional checks
console.log('\n🔧 Additional checks:');

// Check if index.html exists in dist
const distIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(distIndexPath)) {
  console.log('✅ index.html - Present in dist folder');
  
  // Check if index.html contains SEO meta tags
  const indexContent = fs.readFileSync(distIndexPath, 'utf8');
  const hasSEOTags = indexContent.includes('meta name="description"') && 
                    indexContent.includes('meta property="og:title"') &&
                    indexContent.includes('application/ld+json');
  
  if (hasSEOTags) {
    console.log('✅ SEO meta tags - Present in index.html');
  } else {
    console.log('⚠️  SEO meta tags - May be missing or incomplete');
  }
} else {
  console.log('❌ index.html - Missing in dist folder');
}

console.log('\n✨ SEO verification complete!'); 