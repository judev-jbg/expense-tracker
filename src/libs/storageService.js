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

  // Subir archivo temporal (sin expenseId)
  uploadTempFile: async (file, tempSessionId, userId) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `temp/${userId}/${tempSessionId}/${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;

      // Verificar espacio disponible
      const spaceCheck = await storageService.checkStorageSpace(userId);
      if (!spaceCheck.canUpload) {
        const cleanup = await storageService.cleanupOldFiles(userId);
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

  // Mover archivos temporales a definitivos
  moveTempFiles: async (tempSessionId, expenseId, userId) => {
    try {
      // Obtener archivos temporales de la sesión
      const { data: tempFiles, error: fetchError } = await supabase
        .from("expense_documents")
        .select("*")
        .eq("temp_upload_session", tempSessionId)
        .eq("is_temp", true);

      if (fetchError) throw fetchError;

      const movedFiles = [];

      for (const tempFile of tempFiles) {
        // Crear nueva ruta definitiva
        const fileExt = tempFile.file_name.split(".").pop();
        const newFileName = `${userId}/${expenseId}/${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileExt}`;

        // Mover archivo en storage
        const { data: moveData, error: moveError } = await supabase.storage
          .from("expense-documents")
          .move(tempFile.storage_path, newFileName);

        if (moveError) {
          console.error("Error moving file:", moveError);
          continue; // Continuar con otros archivos
        }

        // Actualizar registro en base de datos
        const { data: updatedFile, error: updateError } = await supabase
          .from("expense_documents")
          .update({
            expense_id: expenseId,
            storage_path: newFileName,
            is_temp: false,
            temp_upload_session: null,
            temp_created_at: null,
          })
          .eq("id", tempFile.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating file record:", updateError);
        } else {
          movedFiles.push(updatedFile);
        }
      }

      return { data: movedFiles, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Limpiar archivos temporales de una sesión
  cleanupTempSession: async (tempSessionId) => {
    try {
      // Obtener archivos de la sesión
      const { data: tempFiles, error: fetchError } = await supabase
        .from("expense_documents")
        .select("storage_path")
        .eq("temp_upload_session", tempSessionId)
        .eq("is_temp", true);

      if (fetchError) throw fetchError;

      // Eliminar archivos del storage
      const paths = tempFiles.map((f) => f.storage_path);
      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("expense-documents")
          .remove(paths);

        if (storageError) {
          console.error(
            "Error removing temp files from storage:",
            storageError
          );
        }
      }

      // Eliminar registros de la base de datos
      const { error: dbError } = await supabase
        .from("expense_documents")
        .delete()
        .eq("temp_upload_session", tempSessionId)
        .eq("is_temp", true);

      if (dbError) throw dbError;

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
};
