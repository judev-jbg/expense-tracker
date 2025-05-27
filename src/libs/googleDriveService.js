// Google Drive service for file uploads
export const googleDriveService = {
  // Upload file to Google Drive (this will be handled by backend)
  uploadFile: async (file, expenseId, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("expenseId", expenseId);
      formData.append("metadata", JSON.stringify(metadata));

      // This would typically call your backend API
      // For now, we'll simulate the upload
      const response = await fetch("/api/upload-to-drive", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // For development/testing, we'll create a mock upload
  mockUpload: async (file, expenseId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFileId = `mock_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const mockUrl = `https://drive.google.com/file/d/${mockFileId}/view`;

        resolve({
          data: {
            google_drive_file_id: mockFileId,
            google_drive_url: mockUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            expense_id: expenseId,
            is_receipt: true,
          },
          error: null,
        });
      }, 1500); // Simulate upload time
    });
  },

  // Generate shareable link
  getShareableLink: (fileId) => {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  },

  // Generate preview link
  getPreviewLink: (fileId) => {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  },
};
