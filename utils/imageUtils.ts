// client/utils/imageUtils.ts

import defaultUserLogo from '../app/assets/userLogo.png'; // Adjust path as per your project structure

// Use the dedicated media URL directly.
// This should be the base URL for static files (e.g., 'http://localhost:5001' or 'https://your-render-app.onrender.com').
const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

/**
 * Resolves an avatar URL, prepending the backend static URL if it's a relative path.
 * Falls back to a default logo if no valid avatar URL is provided.
 *
 * This function should handle:
 * 1. Full HTTP/HTTPS URLs (e.g., from social logins, or if backend sends absolute URLs)
 * 2. Relative paths starting with '/' (e.g., '/uploads/avatars/filename.png')
 * 3. Relative paths without a leading '/' (e.g., 'uploads/avatars/filename.png')
 * 4. Data URIs
 * 5. Null, undefined, or empty paths (fallback to default image)
 *
 * @param avatarPath The avatar path/URL from your backend.
 * @returns The full, resolved URL for the avatar, or the default user logo URL.
 */
export const getFullAvatarUrl = (avatarPath: string | null | undefined): string => {
    if (avatarPath && typeof avatarPath === 'string' && avatarPath.trim() !== '') {
        // If it's already an absolute URL or a data URI, return as is.
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:')) {
            return avatarPath;
        }

        // For relative paths, ensure there's a leading slash if needed,
        // then combine with the base URL.
        // Example: If avatarPath is "uploads/avatars/dev-123.png", it becomes "/uploads/avatars/dev-123.png"
        // Then combined with BACKEND_STATIC_BASE_URL (http://localhost:5001), it becomes
        // http://localhost:5001/uploads/avatars/dev-123.png
        const cleanedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
        return `${BACKEND_STATIC_BASE_URL}${cleanedPath}`;
    }

    // Fallback to the default logo if avatarPath is null, undefined, or empty
    return defaultUserLogo.src;
};