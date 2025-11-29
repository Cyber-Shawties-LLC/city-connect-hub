# Dashboard Blank Screen - Troubleshooting Guide

## Quick Fixes to Try

### 1. Check Browser Console
Open Developer Tools (F12) and check the Console tab for errors. Common issues:
- JavaScript errors
- Missing imports
- Component rendering errors

### 2. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### 3. Check if Dependencies are Installed
```bash
npm install
```

### 4. Check for Build Errors
```bash
npm run build
```

## Common Causes

### Issue 1: Custom Element Error
The `<gradio-app>` custom element might be causing React to fail.

**Fix**: The GradioEmbed component now uses DOM API to create the element, which should avoid React parsing issues.

### Issue 2: Missing Error Boundary
If a component throws an error, the whole app can crash.

**Fix**: Added ErrorBoundary component to catch and display errors gracefully.

### Issue 3: Location Provider Error
If `useLocation()` is called outside LocationProvider, it will throw an error.

**Fix**: DashboardContent is properly wrapped in LocationProvider.

## Debugging Steps

1. **Open Browser Console** (F12)
2. **Check for Red Errors** - These will tell you what's wrong
3. **Check Network Tab** - See if any resources failed to load
4. **Check React DevTools** - If installed, see component tree

## Temporary Fix: Disable Gradio Embed

If the Gradio embed is causing issues, you can temporarily disable it:

1. Comment out the GradioEmbed import in `ChatBox.tsx`
2. Remove the fallback logic that uses GradioEmbed
3. This will force the API to be used (or show errors)

## Check These Files

- `src/pages/Dashboard.tsx` - Main dashboard component
- `src/components/LocationSelector.tsx` - Location selector
- `src/components/GradioEmbed.tsx` - Gradio embed component
- `src/components/ChatBox.tsx` - Chat box component

## If Still Blank

1. Check if other pages work (/, /auth, /about)
2. If only dashboard is blank, the issue is in Dashboard.tsx or its children
3. Check browser console for specific error messages
4. Try removing components one by one to isolate the issue

