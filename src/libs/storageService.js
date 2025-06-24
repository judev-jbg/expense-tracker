import { supabase } from "./supabase";

export const storageService = {
  // Subir archivo
  uploadFile: async (file, expenseId, userId) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${expenseId}/${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;

      // Verificar espacio disponible antes de subir
      const spaceCheck = await storageService.checkStorageSpace(userId);
      if (!spaceCheck.canUpload) {
        // Intentar limpiar espacio automáticamente
        const cleanup = await storageService.cleanupOldFiles(userId);
        console.log("Cleanup result:", cleanup);

        // Verificar de nuevo después de la limpieza
        const recheckSpace = await storageService.checkStorageSpace(userId);
        if (!recheckSpace.canUpload) {
          throw new Error(
            `Espacio insuficiente. Usado: ${recheckSpace.usagePercentage}%`
          );
        }
      }

      const { data, error } = await supabase.storage
        .from("expense-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("expense-documents")
        .getPublicUrl(fileName);

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          url: urlData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Eliminar archivo
  deleteFile: async (path) => {
    try {
      const { error } = await supabase.storage
        .from("expense-documents")
        .remove([path]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Obtener URL de archivo
  getFileUrl: (path) => {
    const { data } = supabase.storage
      .from("expense-documents")
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Verificar espacio de almacenamiento
  checkStorageSpace: async (userId) => {
    try {
      const { data, error } = await supabase.rpc("get_user_storage_stats", {
        user_uuid: userId,
      });

      if (error) throw error;

      const UPLOAD_THRESHOLD = 85; // No permitir subir si está por encima del 85%

      return {
        data,
        canUpload: data.usage_percentage < UPLOAD_THRESHOLD,
        usagePercentage: data.usage_percentage,
        availableSpace: data.available_space,
        totalSize: data.total_size,
        fileCount: data.file_count,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        canUpload: false,
        error: error.message,
      };
    }
  },

  // Limpiar archivos antiguos
  cleanupOldFiles: async (userId) => {
    try {
      const { data, error } = await supabase.rpc("cleanup_old_files", {
        user_uuid: userId,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener estadísticas de almacenamiento
  getStorageStats: async (userId) => {
    try {
      const { data, error } = await supabase.rpc("get_user_storage_stats", {
        user_uuid: userId,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
};
