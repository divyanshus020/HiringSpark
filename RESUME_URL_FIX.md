# Resume URL Fix - Production Deployment Issue

## समस्या (Problem)
जब KVM server पर deployed application में candidate की CV पर click करते थे, तो वो `http://localhost:5000/uploads/...` redirect कर रहा था instead of `https://hirespark.hiringbazaar.in/uploads/...`

## मूल कारण (Root Cause)
Frontend code में resume URLs को construct करते समय `import.meta.env.VITE_API_URL` का use हो रहा था, जो development में `http://localhost:5000/api` था। Production में भी यही value use हो रही थी क्योंकि `.env` file में production URL set नहीं था।

## समाधान (Solution)

### 1. Utility Functions Created
**File:** `frontend/src/lib/utils.ts`

दो नए utility functions बनाए गए:

```typescript
/**
 * Get the backend base URL for file access (uploads, resumes, etc.)
 * In development: uses VITE_API_URL or localhost
 * In production: uses current domain
 */
export const getBackendHost = (): string => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development: use VITE_API_URL or fallback to localhost
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  } else {
    // Production: use current domain
    return window.location.origin;
  }
};

/**
 * Construct full URL for a file path
 * @param filePath - Relative or absolute file path
 * @returns Full URL to access the file
 */
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // If already a full URL, return as is
  const isFullUrl = /^https?:\/\//i.test(filePath);
  if (isFullUrl) return filePath;
  
  // Construct full URL with backend host
  const backendHost = getBackendHost();
  return `${backendHost}${filePath}`;
};
```

### 2. Updated Files

सभी files में जहाँ resume URLs open हो रहे थे, वहाँ `getFileUrl()` utility का use किया गया:

#### ✅ Fixed Files:
1. **frontend/src/admin/Candidates.tsx**
   - `handleViewCV` function updated
   
2. **frontend/src/hr/pages/Candidates.tsx**
   - `handleViewCV` function updated
   
3. **frontend/src/components/CandidateDetailsModal.tsx**
   - Resume button onClick handler updated
   
4. **frontend/src/admin/JobPostingDetail.tsx**
   - `handleViewCV` function updated
   
5. **frontend/src/admin/Partners.tsx**
   - Two resume URL handlers updated

## कैसे काम करता है (How It Works)

### Development Environment (localhost):
```
window.location.hostname = 'localhost'
→ Uses VITE_API_URL or fallback to 'http://localhost:5000'
→ Resume URL: http://localhost:5000/uploads/candidates/partner/resume.pdf
```

### Production Environment (hirespark.hiringbazaar.in):
```
window.location.hostname = 'hirespark.hiringbazaar.in'
→ Uses window.location.origin
→ Resume URL: https://hirespark.hiringbazaar.in/uploads/candidates/partner/resume.pdf
```

## Deployment Steps

### Option 1: Code Fix (Already Done) ✅
सभी frontend files में code fix कर दिया गया है। अब बस rebuild और redeploy करना है:

```bash
cd frontend
npm run build
# Upload dist folder to KVM server
```

### Option 2: Environment Variable (Optional)
अगर आप चाहें तो KVM server पर `.env` file भी update कर सकते हैं:

```bash
# frontend/.env on KVM server
VITE_API_URL=https://hirespark.hiringbazaar.in/api
VITE_ADMIN_KEY=admin123
```

**Note:** Option 1 (Code Fix) recommended है क्योंकि यह automatically environment detect करता है।

## Testing Checklist

After deployment, test these scenarios:

- [ ] Admin Dashboard → Candidates → Click on CV icon
- [ ] HR Dashboard → Candidates → Click on View Resume
- [ ] Candidate Details Modal → Click on "View Full Resume" button
- [ ] Job Posting Detail → Candidate list → Click on "View Resume"
- [ ] Partners Page → Click on Resume button

सभी cases में CV को production URL (`https://hirespark.hiringbazaar.in/uploads/...`) से open होना चाहिए।

## Files Changed Summary

| File | Changes | Lines Modified |
|------|---------|----------------|
| `frontend/src/lib/utils.ts` | Added utility functions | +37 |
| `frontend/src/admin/Candidates.tsx` | Updated handleViewCV | ~15 |
| `frontend/src/hr/pages/Candidates.tsx` | Updated handleViewCV | ~10 |
| `frontend/src/components/CandidateDetailsModal.tsx` | Updated resume button | ~5 |
| `frontend/src/admin/JobPostingDetail.tsx` | Updated handleViewCV | ~5 |
| `frontend/src/admin/Partners.tsx` | Updated 2 resume handlers | ~6 |

**Total:** 6 files modified, ~78 lines changed

## Next Steps

1. ✅ Code changes completed
2. ⏳ Rebuild frontend: `npm run build`
3. ⏳ Deploy to KVM server
4. ⏳ Test all resume viewing functionality
5. ⏳ Verify URLs are using production domain

---
**Created:** 2026-02-06
**Issue:** Resume URLs showing localhost in production
**Status:** Fixed ✅
