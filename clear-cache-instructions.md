# Browser Cache Clearing Instructions

## The Issue
The error "useAuthStore is not defined" is likely caused by browser caching an old version of the Dashboard.jsx file that still contained the old import.

## How to Fix This

### Option 1: Hard Refresh (Recommended)
1. Open Developer Tools (F12)
2. Right-click the refresh button in Chrome/Firefox
3. Select "Empty Cache and Hard Reload"
4. Or use keyboard shortcut:
   - Chrome/Firefox: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Edge: `Ctrl + F5`

### Option 2: Clear All Browser Data
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Right-click on "Local Storage" → "Clear"
4. Right-click on "Session Storage" → "Clear"
5. Refresh the page

### Option 3: Incognito/Private Mode
1. Open a new incognito/private window
2. Navigate to the application
3. Test the login flow

## What We Fixed
All components have been updated to use the new AuthContext:
- ✅ Recruiter/Dashboard.jsx - Updated imports and usage
- ✅ Candidate/Dashboard.jsx - Updated imports and usage  
- ✅ Candidate/ResumeUpload.jsx - Updated imports and usage
- ✅ Candidate/Profile.jsx - Updated imports and usage
- ✅ Auth/Register.jsx - Updated imports and usage
- ✅ Sidebar/Sidebar.jsx - Updated imports and usage
- ✅ Navbar/Navbar.jsx - Updated imports and usage

## Verification Steps
1. Clear cache using one of the methods above
2. Navigate to the application
3. Log in as a recruiter
4. Dashboard should load without "useAuthStore is not defined" error
5. Test second login to ensure it works correctly

If the error persists after clearing cache, the issue might be elsewhere in the codebase.
