# Offline Mode Testing Guide

## ✅ What's Fixed

The app now supports **full offline functionality**:
- ✅ User sessions persist offline (7 days)
- ✅ Auto-restore session when offline
- ✅ View cached lectures without internet
- ✅ Mark favorites/completed while offline
- ✅ Offline indicator on login screen
- ✅ Changes sync automatically when back online

---

## 🧪 How to Test Offline Mode

### Test 1: Basic Offline Session Persistence

**Steps:**
1. **Login while online**
   - Open the app: http://localhost:5173
   - Login with your student account
   - You should see the lectures page

2. **View some lectures**
   - Click "View PDF" on 2-3 different lectures
   - PDFs will open in new tabs
   - Wait 2 seconds (background caching happens)
   - Close the PDF tabs

3. **Go offline**
   - **Option A (Chrome DevTools):**
     - Press F12 to open DevTools
     - Go to "Network" tab
     - Check "Offline" checkbox
   - **Option B (Windows):**
     - Disable WiFi or disconnect ethernet

4. **Refresh the page** (F5 or Ctrl+R)
   - ✅ **Expected**: You should stay logged in
   - ✅ **Expected**: You see your lectures
   - ✅ **Expected**: No login screen

5. **Click previously viewed lectures**
   - ✅ **Expected**: Cached PDFs open instantly
   - ✅ **Expected**: Works perfectly offline

---

### Test 2: Offline Indicator

**Steps:**
1. **Logout** (click Logout in sidebar)
2. **Stay offline** (keep internet disconnected)
3. **You should see the login screen with:**
   - ⚠️ Orange warning box
   - Message: "You are currently offline"
   - Message: "Your previous session is still active. Please wait while we restore it..."
4. **Wait 2-3 seconds**
   - ✅ **Expected**: Auto-login happens
   - ✅ **Expected**: You're back at the lectures page

---

### Test 3: Offline Favorites & Completed

**Steps:**
1. **While offline**, navigate to lectures
2. **Click the heart icon** to favorite a lecture
   - ✅ **Expected**: Heart turns red immediately
3. **Click the checkmark icon** to mark as completed
   - ✅ **Expected**: Checkmark turns green immediately
4. **Refresh the page**
   - ✅ **Expected**: Your favorites and completed status persist
5. **Go back online**
   - Turn WiFi back on or uncheck "Offline" in DevTools
6. **Refresh the page**
   - ✅ **Expected**: Changes are synced to server

---

### Test 4: Session Expiry

**Steps:**
1. **Login and use the app normally**
2. **Check localStorage**
   - Open DevTools (F12)
   - Go to "Application" tab → "Local Storage"
   - Look for key: `lms_auth_session`
   - You should see your session data
3. **Session is valid for 7 days**
   - You can stay logged in offline for up to 7 days
   - After 7 days, you'll need to login again online

---

### Test 5: New Lecture Access (Limitation)

**Steps:**
1. **While offline**, try to view a lecture you haven't viewed before
   - Click "View PDF" on a new lecture
   - ✅ **Expected**: PDF URL opens (but won't load without internet)
   - This is a limitation - only previously cached lectures work offline

2. **Workaround for students:**
   - While online, view all important lectures once
   - They'll be automatically cached for offline use

---

## 📊 What Works Offline

| Feature | Offline Support | Notes |
|---------|----------------|-------|
| Login (if session exists) | ✅ Yes | Session valid for 7 days |
| View cached lectures | ✅ Yes | Only previously viewed ones |
| Mark favorites | ✅ Yes | Syncs when back online |
| Mark completed | ✅ Yes | Syncs when back online |
| Navigation | ✅ Yes | Full app navigation works |
| Announcements | ❌ No | Requires online connection |
| Upload lectures (teachers) | ❌ No | Requires online connection |
| View new lectures | ❌ No | Only cached ones available |
| User management (admin) | ❌ No | Requires online connection |

---

## 🔧 Technical Details

### Storage Locations

**LocalStorage** (Authentication):
- Key: `lms_auth_session`
- Contains: User data, session expiry, last activity
- Size: ~1-2 KB per user
- Expiry: 7 days

**IndexedDB** (Lecture PDFs):
- Database: `LectureCache`
- Max size: 100 MB
- Max lectures: 20 PDFs
- Auto-cleanup: Removes least accessed lectures

### How to Clear Cache (for testing)

**Clear auth session:**
```javascript
// In browser console (F12)
localStorage.removeItem('lms_auth_session');
```

**Clear lecture cache:**
```javascript
// In browser console (F12)
indexedDB.deleteDatabase('LectureCache');
```

**Or simply:**
- DevTools → Application → Clear storage → Clear site data

---

## 🐛 Troubleshooting

### Problem: "I refreshed while offline and got logged out"

**Check:**
1. Did you login at least once while online?
2. Has it been more than 7 days since login?
3. Check if session exists: `localStorage.getItem('lms_auth_session')`

**Solution:**
- Login while online
- Session will be saved automatically
- Try offline mode again

---

### Problem: "Cached lecture won't open offline"

**Check:**
1. Did you view this lecture while online before?
2. Was the caching successful? (wait 2+ seconds after viewing)

**Solution:**
- Go back online
- View the lecture again
- Wait 3 seconds
- Go offline and try again

---

### Problem: "Favorites/completed marks disappear on refresh"

**Check:**
- Are you in incognito mode? (LocalStorage won't persist)
- Did you clear browser data?

**Solution:**
- Use regular browser window
- Don't clear site data

---

## 📝 Summary

The offline mode now works perfectly! Students can:

1. **Login once online** → Session saved for 7 days
2. **View lectures** → Auto-cached in background
3. **Go offline** → Full app access continues
4. **Make changes** → Syncs when back online
5. **No interruption** → Seamless online/offline switching

**Test it yourself:** Login → View lectures → Go offline → Refresh → Still works! 🎉
