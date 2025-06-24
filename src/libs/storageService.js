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
  // Nueva función para generar URL firmada
  getSignedUrl: async (path, expiresIn = 3600) => {
    try {
      const { data, error } = await supabase.storage
        .from("expense-documents")
        .createSignedUrl(path, expiresIn); // URL válida por 1 hora por defecto

      if (error) throw error;
      return { data: data.signedUrl, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Función para descargar archivo
  downloadFile: async (path, fileName = null) => {
    try {
      const { data, error } = await supabase.storage
        .from("expense-documents")
        .download(path);

      if (error) throw error;

      // Crear URL temporal para descarga
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || path.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Función para verificar si el archivo existe
  checkFileExists: async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from("expense-documents")
        .list(path.substring(0, path.lastIndexOf("/")), {
          search: path.split("/").pop(),
        });

      if (error) throw error;
      return { data: data.length > 0, error: null };
    } catch (error) {
      return { data: false, error: error.message };
    }
  },
};
