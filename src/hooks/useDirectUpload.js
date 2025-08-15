// src/hooks/useFileUpload.js
import { useState } from "react";
// We need both postData for presigned URLs and the special uploadFormData for course materials
import { postData, uploadFile as uploadFormData } from "../frontend/utils/BackendRequestHelper";

export const useFileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Main upload function with conditional logic based on purpose.
   * @param {File} file - The file to upload.
   * @param {object} options - Upload options.
   * @param {'avatar' | 'course_material'} options.purpose - The purpose of the upload.
   * @param {function} [options.onSuccess] - Optional callback to run with the result on successful upload.
   */
  const upload = async (file, { purpose, onSuccess }) => {
    if (!file) {
      setError("No file provided.");
      return null;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (purpose === 'avatar') {
        // Avatars still use the direct-to-S3 presigned URL method
        const { uploadUrl, fileUrl, key: s3Key } = await postData("/uploads/presign", {
          fileName: file.name,
          fileType: file.type,
          purpose: 'avatar',
        });

        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type, "x-amz-server-side-encryption": "AES256" },
        });

        if (!response.ok) throw new Error(`Upload to S3 failed: ${response.statusText}`);

        if (onSuccess) return await onSuccess(fileUrl, s3Key, file.name);
        return { fileUrl, s3Key };

      } else if (purpose === 'course_material') {
        // Course materials are sent to our backend for processing with multer
        const formData = new FormData();
        formData.append('file', file);

        // Use the special helper for multipart/form-data
        const result = await uploadFormData('/materials/upload', formData); 
        
        if (onSuccess) return await onSuccess(result);
        return result;

      } else {
        throw new Error("Invalid upload purpose specified.");
      }
    } catch (err) {
      console.error(`Upload failed for purpose "${purpose}":`, err);
      const errorMessage = err.message || 'File upload failed.';
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw to allow for local error handling in components
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, error };
};