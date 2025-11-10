# Lecture Caching System & Offline Mode

## Overview
The LMS now includes an **automatic background caching system** and **offline authentication** that allows students to access frequently visited lectures and continue using the app even without internet connection.

## Features

### 1. Automatic Lecture Caching
- When a student **views a lecture PDF**, the system automatically caches it in the background (after 1 second delay)
- The next time the student opens that lecture, it loads **instantly from the cache** even if they're offline
- No manual downloads or buttons required - it just works!

### 2. Offline Authentication
- **Session persistence**: User sessions are saved locally and remain valid for 7 days
- **Offline login**: If you've logged in before, you can continue using the app offline
- **Auto-restore**: When offline, the app automatically restores your previous session
- **Seamless experience**: No re-login required when going offline/online

### Smart Cache Management
- **Maximum cache size**: 100 MB
- **Maximum cached lectures**: 20 lectures
- When limits are reached, the system automatically removes the **least accessed lectures**
- Uses **IndexedDB** for efficient local storage

### Offline Access
- If a student has previously viewed a lecture, they can access it offline
- The system automatically detects if a cached version is available
- Falls back to online version if cache is unavailable

## Technical Implementation

### Key Components

1. **Cache Manager** (`src/utils/cacheManager.ts`)
   - Handles all IndexedDB operations
   - Manages cache size and limits
   - Tracks access frequency for smart cleanup

2. **Offline Auth Manager** (`src/utils/offlineAuth.ts`) **[NEW]**
   - Saves user sessions to localStorage
   - Validates and extends session expiry
   - Syncs user data updates (favorites, completed lectures)
   - 7-day session duration

3. **Cache Hook** (`src/hooks/useLectureCache.ts`)
   - React hook for easy integration
   - Provides caching functions and state

4. **Auto-caching in App.tsx**
   - `handleViewPDF()` function automatically triggers caching
   - Prioritizes offline versions when available
   - Background caching for online views
   - Offline session restoration in auth listener

### Storage Structure
```javascript
// IndexedDB (for PDFs)
Database: 'LectureCache'
├── lectures (store)
│   ├── id (primary key)
│   ├── pdfBlob (PDF file data)
│   ├── accessCount (usage tracking)
│   ├── lastAccessed (timestamp)
│   └── cachedAt (timestamp)
└── cacheMetadata (store)
    ├── totalSize
    ├── lectureCount
    └── lastCleanup

// LocalStorage (for auth session)
Key: 'lms_auth_session'
Value: {
  user: { id, email, name, role, favorites, completedLectures },
  expiresAt: timestamp,
  lastActivity: timestamp
}
```

## User Experience

### For Students:

**Online Experience:**
1. Login with email and password
2. Click "View PDF" on any lecture
3. The PDF opens in a new tab
4. **Behind the scenes**: The system caches it for offline use
5. Your session is saved locally (valid for 7 days)

**Offline Experience:**
1. Lose internet connection or go offline
2. Refresh the page or reopen the app
3. **Automatic**: Your previous session is restored
4. Access all previously viewed (cached) lectures
5. Mark lectures as favorites or completed (syncs when back online)
6. See offline indicator on login screen if not authenticated

**Offline Limitations:**
- Cannot view new lectures (only cached ones)
- Cannot access announcements (requires online)
- Cannot upload new content
- User changes sync when back online

### No UI Changes
- No cache buttons or indicators
- No manual management needed
- Works completely transparently

## Benefits

✅ **Instant loading** for frequently accessed lectures  
✅ **Offline access** to previously viewed content  
✅ **Persistent sessions** - no need to re-login for 7 days  
✅ **Offline navigation** - full app access when offline  
✅ **Zero user interaction** required  
✅ **Smart cleanup** manages storage automatically  
✅ **Bandwidth savings** from cached content  
✅ **Seamless sync** when back online

## Browser Compatibility
- Modern browsers with IndexedDB support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## Performance
- First view: Normal online loading
- Subsequent views: Near-instant from cache
- Background caching doesn't block UI
- Automatic cleanup prevents storage issues
- Session restoration: < 100ms
- Offline mode detection: Instant

## Testing Offline Mode

1. **Login while online**
2. **View some lectures** (they get cached automatically)
3. **Go offline** (disable wifi or use browser DevTools)
4. **Refresh the page**
5. ✅ You should stay logged in
6. ✅ You can view cached lectures
7. ✅ You can navigate the app
8. ✅ See offline indicator on login screen
