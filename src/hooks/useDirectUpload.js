// src/hooks/useDirectUpload.js
import { useState } from 'react';
import { postData, putData } from '../frontend/utils/BackendRequestHelper';

export const useDirectUpload = () => {
  const [loading, setLoading] = useState(false);

  const upload = async (file) => {
    if (!file || !/image\/(png|jpe?g|webp)/i.test(file.type)) {
      throw new Error('Only PNG, JPG, and WebP images are allowed');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('File size exceeds 5MB limit');
    }

    setLoading(true);

    try {
      // Step 1: Get presigned URL and fileUrl from backend
      const { uploadUrl, fileUrl } = await postData('/profile/avatar/presign', {
        fileName: file.name,
        fileType: file.type,
      });

      // Step 2: Upload to S3
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      // Step 3: Update profile with fileUrl - NOTE: This is the S3 URL, not presigned
      const profileResponse = await putData('/profile/avatar', { avatar_url: fileUrl });
      
      return profileResponse.profile;

    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading };
};

// New hook for getting presigned avatar URLs
export const useAvatarUrl = () => {
  const [loading, setLoading] = useState(false);

  const getAvatarUrl = async () => {
    setLoading(true);
    try {
      const { url } = await getData('/profile/avatar/view');
      return url;
    } catch (error) {
      console.error('Failed to get avatar URL:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getAvatarUrl, loading };
};