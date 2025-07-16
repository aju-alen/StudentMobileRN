# Render Deployment Guide for CoachAcadem

## 🚀 Deployment Overview

This guide ensures that all SEO files are properly included when deploying to Render.

## 📁 File Structure

After building, your `dist` folder should contain:

```
dist/
├── index.html (with SEO meta tags)
├── robots.txt
├── sitemap.xml
├── sitemap-index.xml
├── keywords.txt
├── manifest.json
├── browserconfig.xml
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [other build files]
```

## 🔧 Build Process

### 1. Local Build Verification

Before deploying, run the SEO verification:

```bash
# Build with SEO verification
npm run build:seo

# Or build and verify separately
npm run build
npm run verify-seo
```

### 2. Render Build Configuration

In your Render dashboard, set the following:

**Build Command:**
```bash
npm run build:seo
```

**Publish Directory:**
```
dist
```

**Environment Variables:**
```
NODE_ENV=production
```

## 📋 Render Service Configuration

### Static Site Configuration

1. **Service Type:** Static Site
2. **Build Command:** `npm run build:seo`
3. **Publish Directory:** `dist`
4. **Environment:** Node.js 18+

### Environment Variables

Set these in your Render dashboard:

```
NODE_ENV=production
VITE_APP_URL=https://your-app-name.onrender.com
VITE_API_URL=https://your-api-url.com
```

## 🔍 SEO Verification Checklist

After deployment, verify these URLs are accessible:

- ✅ `https://your-app-name.onrender.com/robots.txt`
- ✅ `https://your-app-name.onrender.com/sitemap.xml`
- ✅ `https://your-app-name.onrender.com/sitemap-index.xml`
- ✅ `https://your-app-name.onrender.com/manifest.json`
- ✅ `https://your-app-name.onrender.com/browserconfig.xml`

## 🛠️ Troubleshooting

### SEO Files Missing

If SEO files are missing from the deployed site:

1. **Check Build Logs:** Ensure `copyPublicDir: true` is working
2. **Verify File Locations:** All SEO files should be in `/public/`
3. **Check Build Command:** Use `npm run build:seo` for verification
4. **Manual Copy:** If needed, manually copy files to `dist/`

### Common Issues

**Issue:** `robots.txt` not found
**Solution:** Ensure file is in `public/robots.txt`

**Issue:** Sitemap returns 404
**Solution:** Verify `sitemap.xml` is in `public/sitemap.xml`

**Issue:** Meta tags not updating
**Solution:** Check `react-helmet-async` implementation

## 📊 Post-Deployment SEO Checks

### 1. Google Search Console

1. Add your domain to Google Search Console
2. Submit sitemap: `https://your-app-name.onrender.com/sitemap.xml`
3. Verify robots.txt: `https://your-app-name.onrender.com/robots.txt`

### 2. Social Media Testing

Test social media sharing:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 3. SEO Tools

Run these tools to verify SEO:
- Google PageSpeed Insights
- GTmetrix
- Screaming Frog SEO Spider
- SEMrush Site Audit

## 🔄 Continuous Deployment

### Automatic Builds

Render automatically rebuilds when you push to your main branch.

### Build Optimization

The current Vite config includes:
- Code splitting for better performance
- SEO file copying
- Asset optimization
- Manual chunks for vendor libraries

## 📈 Performance Monitoring

### Core Web Vitals

Monitor these metrics in Google Search Console:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### SEO Performance

Track these metrics:
- Organic traffic
- Search rankings
- Click-through rates
- Page load speeds

## 🎯 Best Practices

1. **Always verify SEO files** before deployment
2. **Test social media sharing** after deployment
3. **Submit sitemap** to search engines
4. **Monitor Core Web Vitals**
5. **Keep SEO files updated** with new content

## 🆘 Support

If you encounter issues:

1. Check Render build logs
2. Verify file permissions
3. Test locally with `npm run build:seo`
4. Contact Render support if needed

---

**Last Updated:** January 2024
**Version:** 1.0 