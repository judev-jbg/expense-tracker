import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../common/Button";
import { AiFillHome } from "react-icons/ai";
import {
  MdFlatware,
  MdLightbulb,
  MdDirectionsBus,
  MdGasMeter,
} from "react-icons/md";
import { IoFastFoodSharp, IoGameController } from "react-icons/io5";
import { RiGasStationFill } from "react-icons/ri";
import { FaCarSide } from "react-icons/fa6";
import { FaGraduationCap } from "react-icons/fa6";
import { IoIosCard, IoIosWater } from "react-icons/io";
import { PiFilmSlateFill } from "react-icons/pi";
import { FaMobile, FaStore } from "react-icons/fa";
import { TbTargetArrow, TbPillFilled } from "react-icons/tb";
import { BsFillSuitcase2Fill } from "react-icons/bs";
import { GiElectric } from "react-icons/gi";

const ExpenseTypeForm = ({ expenseType, onSubmit, onCancel, isEditing }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      icon: <IoIosCard />,
      color: "#6750a4",
    },
  });

  const watchedColor = watch("color");

  useEffect(() => {
    if (expenseType) {
      reset({
        name: expenseType.name || "",
        description: expenseType.description || "",
        icon: expenseType.icon || <IoIosCard />,
        color: expenseType.color || "#6750a4",
      });
    }
  }, [expenseType, reset]);

  const onFormSubmit = async (data) => {
    const success = await onSubmit(data);
    if (success) {
      reset();
    }
  };

  const commonIcons = [
    <MdLightbulb />,
    <IoIosWater />,
    <MdGasMeter />,
    <GiElectric />,
    <MdFlatware />,
    <FaStore />,
    <IoFastFoodSharp />,
    <FaCarSide />,
    <IoIosCard />,
    <PiFilmSlateFill />,
    <AiFillHome />,
    <FaMobile />,
    <RiGasStationFill />,
    <MdDirectionsBus />,
    <TbTargetArrow />,
    <TbPillFilled />,
    <FaGraduationCap />,
    <BsFillSuitcase2Fill />,
    <IoGameController />,
  ];

  return (
    <div className="expense-type-form md-card">
      <div className="form-header">
        <h3 className="md-typescale-title-large">
          {isEditing ? "Editar Tipo de gasto" : "Nuevo Tipo de gasto"}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="name" className="md-text-field-label">
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              className={`md-text-field-input ${errors.name ? "error" : ""}`}
              placeholder="ej. Comida & Comerdores, Servicios, Suscripciones"
              {...register("name", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 caracteres",
                },
                maxLength: {
                  value: 50,
                  message: "El nombre debe tener menos de 50 caracteres",
                },
              })}
              disabled={isSubmitting}
              autoFocus="true"
            />
            {errors.name && (
              <span className="md-text-field-error">{errors.name.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="description" className="md-text-field-label">
              Descripción
            </label>
            <textarea
              id="description"
              className={`md-text-field-input ${
                errors.description ? "error" : ""
              }`}
              placeholder="Breve descripción de este tipo de gasto"
              rows="3"
              {...register("description", {
                maxLength: {
                  value: 200,
                  message: "La descripción debe tener menos de 200 caracteres",
                },
              })}
              disabled={isSubmitting}
            />
            {errors.description && (
              <span className="md-text-field-error">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-row form-row-split">
          <div className="md-text-field">
            <label htmlFor="icon" className="md-text-field-label">
              Icono
            </label>
            <input
              id="icon"
              type="text"
              className={`md-text-field-input ${errors.icon ? "error" : ""}`}
              placeholder={<IoIosCard />}
              {...register("icon", {
                required: "El icono es obligatorio",
              })}
              disabled={isSubmitting}
            />
            {errors.icon && (
              <span className="md-text-field-error">{errors.icon.message}</span>
            )}
          </div>

          <div className="md-text-field">
            <label htmlFor="color" className="md-text-field-label">
              Color
            </label>
            <div className="color-input-wrapper">
              <input
                id="color"
                type="color"
                className="color-input"
                {...register("color", {
                  required: "El color es obligatorio",
                })}
                disabled={isSubmitting}
              />
              {/* <div
                className="color-preview"
                style={{ backgroundColor: watchedColor }}
              /> */}
            </div>
            {errors.color && (
              <span className="md-text-field-error">
                {errors.color.message}
              </span>
            )}
          </div>
        </div>

        <div className="icon-selector">
          <label className="md-text-field-label">
            Selección rápida de iconos
          </label>
          <div className="icon-grid">
            {commonIcons.map((icon, index) => (
              <button
                key={index}
                type="button"
                className="icon-option"
                onClick={() => reset({ ...watch(), icon })}
                disabled={isSubmitting}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="md-button md-button-outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <Button
            type="submit"
            className={`${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
              ? "Actualizar Tipo de gasto"
              : "Crear Tipo de gasto"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseTypeForm;
