# Debug Offline Mode - Step by Step

## 🔍 Testing Instructions with Console Logs

### Step 1: Clear Everything First

1. Open the app in your browser
2. Press **F12** to open DevTools
3. Go to **Console** tab (keep it open for all tests)
4. Go to **Application** tab → **Storage** → **Clear site data** → **Clear all**
5. Close DevTools (or keep Console tab visible)

### Step 2: Login While Online

1. **Make sure you're ONLINE** (WiFi/Ethernet connected)
2. Login with your student credentials
3. **Check Console** - you should see:
   ```
   ✅ Session saved for offline access: your-email@example.com
   ✅ Categories cached: X items
   ✅ Lectures cached: Y items
   ```
4. If you see this, **Session and data are saved!** ✅

---

### Step 3: View Some Lectures

1. Go to the Lectures page
2. Click **"View PDF"** on 2-3 different lectures
3. Wait **3 seconds** after each one (for background caching)
4. Close the PDF tabs

### Step 3.5: Check Data Caching

1. **F12** → **Application** tab
2. **Local Storage** → `http://localhost:5173`
3. Look for keys:
   - `lms_cached_categories` (subjects/stages)
   - `lms_cached_lectures` (lectures list)
4. Click on them to see JSON data

---

### Step 4: Go Offline

**Option A - Chrome DevTools:**
1. Press **F12** → **Network** tab
2. Check the **"Offline"** checkbox at the top
3. You should see "⚠️ No internet" in the Network tab

**Option B - Disable WiFi:**
1. Turn off WiFi or unplug ethernet
2. Wait 2 seconds

---

### Step 5: Refresh the Page

1. Press **F5** or **Ctrl+R** to refresh
2. **Watch the Console** - you should see:
   ```
   ✅ Found valid cached session: your-email@example.com
   Found cached session on mount
   ```

### What Should Happen:
- ✅ You stay logged in
- ✅ You see the lectures page
- ✅ NO login screen!

### If You See Login Screen:
- ❌ Check console for errors
- ❌ Check if session was saved (Step 2)
- ❌ Check Application → Local Storage → `lms_auth_session`

---

## 🐛 Troubleshooting

### Problem: Still seeing login screen offline

**Check Console for these messages:**

1. **If you see:** `❌ No cached session found`
   - **Cause:** Session wasn't saved
   - **Fix:** 
     - Go back online
     - Login again
     - Make sure you see: `✅ Session saved for offline access`
     - Try offline again

2. **If you see:** `⏰ Session expired`
   - **Cause:** More than 7 days passed
   - **Fix:** Login again while online

3. **If you see:** `Error getting cached session`
   - **Cause:** localStorage is disabled or corrupted
   - **Fix:**
     - Check if you're in Incognito mode (doesn't work there)
     - Clear site data and try again
     - Check browser settings for localStorage

---

### Manual Check: Is Session Saved?

1. **F12** → **Application** tab
2. **Local Storage** → `http://localhost:5173`
3. Look for key: `lms_auth_session`
4. Click on it - you should see JSON with your user data

### Manual Check: Are Categories/Lectures Cached?

1. **F12** → **Application** tab
2. **Local Storage** → `http://localhost:5173`
3. Look for keys:
   - `lms_cached_categories` (subjects/stages)
   - `lms_cached_lectures` (lectures list)
4. Click on them to see JSON data

**Example:**
```json
{
  "user": {
    "id": "abc123",
    "email": "student@test.com",
    "name": "Student Name",
    "role": "student",
    ...
  },
  "expiresAt": 1234567890,
  "lastActivity": 1234567890
}
```

**If you don't see this:**
- Session wasn't saved
- Login again while online

---

### Manual Check: Are Lectures Cached?

1. **F12** → **Application** tab
2. **IndexedDB** → **LectureCache** → **lectures**
3. You should see entries for each lecture you viewed

If you don't see any:
- Lectures weren't cached
- View some lectures while online
- Wait 3 seconds after each
- Check again

---

## 📊 Console Log Reference

### Success Messages:
```
✅ Session saved for offline access: email@example.com
✅ Found valid cached session: email@example.com
Found cached session on mount
📦 Loading cached categories for immediate display
📦 Loading cached lectures for immediate display
📡 Fetching fresh categories from Firebase
📡 Fetching fresh lectures from Firebase
✅ Categories updated from Firebase: 3 items
✅ Lectures updated from Firebase: 5 items
📱 Offline mode: Using cached categories only
📱 Offline mode: Using cached lectures only
✅ Lectures cached: 5 items
✅ Categories cached: 3 items
✅ Found cached lectures: 5 items
✅ Found cached categories: 3 items
Using cached session (offline mode - error handler)
No Firebase auth, using cached session
```

### Warning Messages:
```
❌ No cached session found
⏰ Session expired
Error fetching user data: [error details]
Error fetching categories: [error details]
```

---

## 🧪 Full Test Scenario

Run this complete test:

```
1. Clear all site data
2. Login while ONLINE
   → Console: "✅ Session saved for offline access"
   
3. View 2 lectures
   → Wait 3 seconds
   
4. Check localStorage
   → Application tab → Local Storage → lms_auth_session exists
   
5. Check IndexedDB
   → Application tab → IndexedDB → LectureCache → 2 lectures
   
6. Go OFFLINE
   → Network tab → Check "Offline"
   
7. Refresh (F5)
   → Console: "✅ Found valid cached session"
   → Console: "Found cached session on mount"
   → Still logged in! ✅
   
8. Click a cached lecture
   → Opens from cache (instant) ✅
   
9. Go back ONLINE
   → Uncheck "Offline"
   
10. Refresh (F5)
    → Everything works normally ✅
```

---

## 🎯 Expected Results

| Action | Expected Console Log | Expected Behavior |
|--------|---------------------|-------------------|
| Login online | `✅ Session saved` | Normal login |
| Refresh online | `✅ Found valid cached session` | Stays logged in |
| Go offline | No error | Works normally |
| Refresh offline | `✅ Found valid cached session`<br>`Found cached session on mount` | **Stays logged in** |
| Click cached lecture offline | `Background caching failed` (expected) | PDF opens from cache |
| Go back online | No error | Syncs changes |

---

## 💡 Tips

1. **Always check Console** - it tells you exactly what's happening
2. **Keep DevTools open** - easier to debug
3. **Test in regular window** - NOT incognito (localStorage doesn't persist)
4. **Wait 2-3 seconds** after login before going offline
5. **Clear cache between tests** for clean testing

---

## ✅ Success Criteria

You know it's working when:
- ✅ Console shows: `📦 Loading cached categories for immediate display`
- ✅ Console shows: `📦 Loading cached lectures for immediate display`
- ✅ Console shows: `✅ Session saved for offline access`
- ✅ Console shows: `Found cached session on mount`
- ✅ You can refresh while offline and stay logged in
- ✅ Dropdowns show subjects/stages immediately
- ✅ Lectures list shows immediately
- ✅ Cached lectures open instantly offline
- ✅ Favorites/completed persist offline

If all these work → **Offline mode is working perfectly!** 🎉
