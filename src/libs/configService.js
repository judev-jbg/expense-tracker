import { supabase, dbHelpers } from "./supabase";
import React from "react";
import {
  AiFillPieChart,
  AiOutlineBarChart,
  AiOutlineLineChart,
} from "react-icons/ai";

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
export const dashboardService = {
  // Get dashboard summary for a specific period
  getDashboardData: async (year, month = null) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Build base query
      let query = supabase
        .from("expenses")
        .select(
          `
          amount,
          expense_date,
          expense_type_id,
          entity_id,
          expense_types (id, name, icon, color),
          entities (id, name)
        `
        )
        .eq("created_by", user.id)
        .eq("year", year);

      if (month) {
        query = query.eq("month", month);
      }

      const { data: expenses, error } = await query.order("expense_date", {
        ascending: false,
      });

      if (error) throw error;

      // Calculate summary statistics
      const totalAmount = expenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0
      );
      const expenseCount = expenses.length;
      const avgExpenseAmount =
        expenseCount > 0 ? totalAmount / expenseCount : 0;

      // Group by expense type
      const byExpenseType = expenses.reduce((acc, expense) => {
        const type = expense.expense_types;
        const key = type.id;

        if (!acc[key]) {
          acc[key] = {
            id: type.id,
            name: type.name,
            icon: type.icon,
            color: type.color,
            amount: 0,
            count: 0,
            percentage: 0,
          };
        }

        acc[key].amount += parseFloat(expense.amount);
        acc[key].count += 1;
        return acc;
      }, {});

      // Calculate percentages
      Object.values(byExpenseType).forEach((type) => {
        type.percentage =
          totalAmount > 0 ? (type.amount / totalAmount) * 100 : 0;
      });

      // Group by entity
      const byEntity = expenses.reduce((acc, expense) => {
        const entity = expense.entities;
        const key = entity.id;

        if (!acc[key]) {
          acc[key] = {
            id: entity.id,
            name: entity.name,
            amount: 0,
            count: 0,
            percentage: 0,
          };
        }

        acc[key].amount += parseFloat(expense.amount);
        acc[key].count += 1;
        return acc;
      }, {});

      // Calculate entity percentages
      Object.values(byEntity).forEach((entity) => {
        entity.percentage =
          totalAmount > 0 ? (entity.amount / totalAmount) * 100 : 0;
      });

      // Group by day for trend analysis
      const dailyExpenses = expenses.reduce((acc, expense) => {
        const date = expense.expense_date;
        if (!acc[date]) {
          acc[date] = {
            date,
            amount: 0,
            count: 0,
          };
        }
        acc[date].amount += parseFloat(expense.amount);
        acc[date].count += 1;
        return acc;
      }, {});

      const dailyTrend = Object.values(dailyExpenses).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      return {
        data: {
          summary: {
            totalAmount,
            expenseCount,
            avgExpenseAmount,
            period: month ? `${month}/${year}` : year.toString(),
          },
          byExpenseType: Object.values(byExpenseType).sort(
            (a, b) => b.amount - a.amount
          ),
          byEntity: Object.values(byEntity)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10), // Top 10 entities
          dailyTrend,
          recentExpenses: expenses.slice(0, 5),
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get monthly comparison data
  getMonthlyComparison: async (year) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("amount, month, expense_types (name, color)")
        .eq("created_by", user.id)
        .eq("year", year)
        .order("month");

      if (error) throw error;

      // Group by month
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthName: new Date(year, i).toLocaleDateString("es-ES", {
          month: "short",
        }),
        amount: 0,
        count: 0,
      }));

      expenses.forEach((expense) => {
        const monthIndex = expense.month - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex].amount += parseFloat(expense.amount);
          monthlyData[monthIndex].count += 1;
        }
      });

      return { data: monthlyData, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get year over year comparison
  getYearlyComparison: async (currentYear, previousYear) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("amount, year, month")
        .eq("created_by", user.id)
        .in("year", [currentYear, previousYear]);

      if (error) throw error;

      const currentYearData = expenses
        .filter((expense) => expense.year === currentYear)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      const previousYearData = expenses
        .filter((expense) => expense.year === previousYear)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      const change =
        previousYearData > 0
          ? ((currentYearData - previousYearData) / previousYearData) * 100
          : 0;

      return {
        data: {
          currentYear: { year: currentYear, amount: currentYearData },
          previousYear: { year: previousYear, amount: previousYearData },
          change,
          changeType:
            change > 0 ? "increase" : change < 0 ? "decrease" : "neutral",
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get expense trends and insights
  getInsights: async (year) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select(
          `
          amount,
          expense_date,
          month,
          expense_types (name, color)
        `
        )
        .eq("created_by", user.id)
        .eq("year", year);

      if (error) throw error;

      const insights = [];

      // Most expensive month
      const monthlyTotals = expenses.reduce((acc, expense) => {
        acc[expense.month] =
          (acc[expense.month] || 0) + parseFloat(expense.amount);
        return acc;
      }, {});

      const mostExpensiveMonth = Object.entries(monthlyTotals).reduce(
        (max, [month, amount]) =>
          amount > max.amount ? { month: parseInt(month), amount } : max,
        { month: 1, amount: 0 }
      );

      if (mostExpensiveMonth.amount > 0) {
        insights.push({
          type: "most_expensive_month",
          title: "Mes de mayor gasto",
          description: `Usted fue el que más gastó en ${new Date(
            year,
            mostExpensiveMonth.month - 1
          ).toLocaleDateString("es-ES", { month: "long" })}`,
          value: mostExpensiveMonth.amount,
          icon: React.createElement(AiOutlineBarChart, null),
        });
      }

      // Average daily spending
      const totalDays =
        expenses.length > 0
          ? new Set(expenses.map((e) => e.expense_date)).size
          : 0;

      const currentMonth = new Date().getMonth() + 1;
      const currentMonthTotal = monthlyTotals[currentMonth];

      if (totalDays > 0 && typeof currentMonthTotal === "number") {
        const dailyAvg = monthlyTotals[new Date().getMonth() + 1] / totalDays;
        insights.push({
          type: "daily_average",
          title: "Media diaria este mes",
          description: `De media, gastas esto al día`,
          value: dailyAvg,
          icon: React.createElement(AiOutlineLineChart, null),
        });
      }

      // Most frequent expense type
      const typeFrequency = expenses.reduce((acc, expense) => {
        const typeName = expense.expense_types.name;
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
      }, {});

      const topType = Object.entries(typeFrequency).reduce(
        (max, [type, count]) => (count > max.count ? { type, count } : max),
        { type: "", count: 0 }
      );

      if (topType.count > 0) {
        insights.push({
          type: "most_frequent",
          title: "Categoría más frecuente",
          description: `${topType.type} aparece más a menudo en sus gastos`,
          value: topType.count,
          icon: React.createElement(AiFillPieChart, null),
        });
      }

      return { data: insights, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
};
export const userManagementService = {
  // Check if current user is admin
  isAdmin: async () => {
    try {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return { isAdmin: data, error: null };
    } catch (error) {
      return { isAdmin: false, error: error.message };
    }
  },

  // Get current user role
  getUserRole: async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_role");
      if (error) throw error;
      return { role: data, error: null };
    } catch (error) {
      return { role: "user", error: error.message };
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from("user_management_view")
        .select("*")
        .order("registered_at", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("user_management_view")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      // First create the user account
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
          },
        });

      if (authError) throw authError;

      // Wait a bit for the trigger to create user preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user preferences with correct role
      const { error: prefsError } = await supabase
        .from("user_preferences")
        .update({
          role: userData.role || "user",
          currency: userData.currency || "EUR",
          theme: userData.theme || "dark",
        })
        .eq("user_id", authData.user.id);

      if (prefsError) {
        console.error("Error updating user preferences:", prefsError);
      }

      return { data: authData.user, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update user (admin only)
  updateUser: async (userId, updates) => {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        email: updates.email,
        user_metadata: {
          first_name: updates.firstName,
          last_name: updates.lastName,
          full_name: `${updates.firstName} ${updates.lastName}`,
        },
      });

      if (error) throw error;

      // Update user preferences
      if (
        updates.role ||
        updates.currency ||
        updates.theme ||
        updates.hasOwnProperty("is_active")
      ) {
        const prefsUpdate = {};
        if (updates.role) prefsUpdate.role = updates.role;
        if (updates.currency) prefsUpdate.currency = updates.currency;
        if (updates.theme) prefsUpdate.theme = updates.theme;
        if (updates.hasOwnProperty("is_active"))
          prefsUpdate.is_active = updates.is_active;

        const { error: prefsError } = await supabase
          .from("user_preferences")
          .update(prefsUpdate)
          .eq("user_id", userId);

        if (prefsError) {
          console.error("Error updating user preferences:", prefsError);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Deactivate user (admin only) - we don't actually delete users
  deactivateUser: async (userId) => {
    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({ is_active: false })
        .eq("user_id", userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Reactivate user (admin only)
  reactivateUser: async (userId) => {
    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({ is_active: true })
        .eq("user_id", userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Reset user password (admin only)
  resetUserPassword: async (userId, newPassword) => {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
};
