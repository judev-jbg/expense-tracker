import { supabase, dbHelpers } from "./supabase";

// Expense Types service
export const expenseTypesService = {
  // Get all expense types for current user
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expense_types")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create new expense type
  create: async (expenseType) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expense_types")
        .insert({
          ...expenseType,
          created_by: user.id,
        })
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update expense type
  update: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("expense_types")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Soft delete expense type
  delete: async (id) => {
    try {
      const { data, error } = await supabase
        .from("expense_types")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
};

// Entities service
export const entitiesService = {
  // Get all entities for current user
  getAll: async (expenseTypeId = null) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("entities")
        .select(
          `
          *,
          expense_types (
            id,
            name,
            icon,
            color
          )
        `
        )
        .eq("created_by", user.id)
        .eq("is_active", true);

      if (expenseTypeId) {
        query = query.eq("expense_type_id", expenseTypeId);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create new entity
  create: async (entity) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("entities").insert({
        ...entity,
        created_by: user.id,
      }).select(`
          *,
          expense_types (
            id,
            name,
            icon,
            color
          )
        `);

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update entity
  update: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("entities")
        .update(updates)
        .eq("id", id).select(`
          *,
          expense_types (
            id,
            name,
            icon,
            color
          )
        `);

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Soft delete entity
  delete: async (id) => {
    try {
      const { data, error } = await supabase
        .from("entities")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
};

// User preferences service
export const userPreferencesService = {
  // Get user preferences
  get: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(); // Cambio: usar maybeSingle() en lugar de single()

      if (error) throw error;
      // maybeSingle() devuelve null si no encuentra nada, no un error
      return { data, error: null };
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return { data: null, error: error.message };
    }
  },

  // Update user preferences
  update: async (preferences) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Clean preferences - convert empty strings to null for UUID fields
      const cleanedPreferences = {
        ...preferences,
        default_expense_type_id:
          preferences.default_expense_type_id === ""
            ? null
            : preferences.default_expense_type_id,
      };

      // Use upsert with onConflict specification
      const { data, error } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: user.id,
            ...cleanedPreferences,
          },
          {
            onConflict: "user_id", // Especificar la columna de conflicto
            ignoreDuplicates: false, // Actualizar si existe
          }
        )
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return { data: null, error: error.message };
    }
  },
};
