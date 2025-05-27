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

export const expensesService = {
  // Get all expenses for current user with filters
  getAll: async (filters = {}) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("expenses")
        .select(
          `
          *,
          expense_types (id, name, icon, color),
          entities (id, name, expense_types (name, icon)),
          expense_documents (id, file_name, google_drive_url, is_receipt)
        `
        )
        .eq("created_by", user.id);

      // Apply filters
      if (filters.year) {
        query = query.eq("year", filters.year);
      }
      if (filters.month) {
        query = query.eq("month", filters.month);
      }
      if (filters.expense_type_id) {
        query = query.eq("expense_type_id", filters.expense_type_id);
      }
      if (filters.entity_id) {
        query = query.eq("entity_id", filters.entity_id);
      }
      if (filters.min_amount) {
        query = query.gte("amount", filters.min_amount);
      }
      if (filters.max_amount) {
        query = query.lte("amount", filters.max_amount);
      }
      if (filters.date_from) {
        query = query.gte("expense_date", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("expense_date", filters.date_to);
      }
      if (filters.search) {
        query = query.or(
          `description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query.order("expense_date", {
        ascending: false,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get single expense by ID
  getById: async (id) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          expense_types (id, name, icon, color),
          entities (id, name, description, contact_info, expense_types (name, icon)),
          expense_documents (
            id, 
            file_name, 
            file_size, 
            mime_type, 
            google_drive_url, 
            google_drive_file_id,
            is_receipt,
            uploaded_at
          )
        `
        )
        .eq("id", id)
        .eq("created_by", user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create new expense
  create: async (expenseData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Parse date and extract year/month
      const expenseDate = new Date(expenseData.expense_date);
      const year = expenseDate.getFullYear();
      const month = expenseDate.getMonth() + 1;

      const { data, error } = await supabase.from("expenses").insert({
        ...expenseData,
        year,
        month,
        created_by: user.id,
      }).select(`
          *,
          expense_types (id, name, icon, color),
          entities (id, name, expense_types (name, icon))
        `);

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update expense
  update: async (id, updates) => {
    try {
      // If expense_date is being updated, recalculate year/month
      if (updates.expense_date) {
        const expenseDate = new Date(updates.expense_date);
        updates.year = expenseDate.getFullYear();
        updates.month = expenseDate.getMonth() + 1;
      }

      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id).select(`
          *,
          expense_types (id, name, icon, color),
          entities (id, name, expense_types (name, icon)),
          expense_documents (id, file_name, google_drive_url, is_receipt)
        `);

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Delete expense
  delete: async (id) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get expense summary (for dashboard)
  getSummary: async (year, month = null) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("expenses")
        .select(
          `
          amount,
          expense_date,
          expense_types (name, icon, color)
        `
        )
        .eq("created_by", user.id)
        .eq("year", year);

      if (month) {
        query = query.eq("month", month);
      }

      const { data, error } = await query.order("expense_date", {
        ascending: false,
      });

      if (error) throw error;

      // Calculate summary
      const totalAmount = data.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0
      );
      const expenseCount = data.length;

      // Group by expense type
      const byType = data.reduce((acc, expense) => {
        const typeName = expense.expense_types.name;
        if (!acc[typeName]) {
          acc[typeName] = {
            name: typeName,
            icon: expense.expense_types.icon,
            color: expense.expense_types.color,
            amount: 0,
            count: 0,
          };
        }
        acc[typeName].amount += parseFloat(expense.amount);
        acc[typeName].count += 1;
        return acc;
      }, {});

      return {
        data: {
          totalAmount,
          expenseCount,
          byType: Object.values(byType),
          expenses: data,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
};

// Expense documents service
export const expenseDocumentsService = {
  // Get documents for an expense
  getByExpenseId: async (expenseId) => {
    try {
      const { data, error } = await supabase
        .from("expense_documents")
        .select("*")
        .eq("expense_id", expenseId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Add document to expense
  create: async (documentData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expense_documents")
        .insert({
          ...documentData,
          uploaded_by: user.id,
        })
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Delete document
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from("expense_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
};
