"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2} from "lucide-react";
import {
  buildRegistroSchema,
  registroDefaultValues,
  RegistroFormInput,
  RegistroFormOutput,
  STEP_FIELDS} from "@/lib/registro/schema";
import { buildRegistroFormData } from "@/lib/registro/formData";
import { getImageDimensions } from "@/lib/registro/validators";
import { FORM_STEPS } from "@/lib/registro/types";
import StepIndicator from "./StepIndicator";
import Step1DatosGenerales from "./steps/Step1DatosGenerales";
import Step2Contacto from "./steps/Step2Contacto";
import Step3Ubicacion from "./steps/Step3Ubicacion";
import Step4PerfilProfesional from "./steps/Step4PerfilProfesional";
import Step5ServiciosProfesionales from "./steps/Step5ServiciosProfesionales";
import Step6DatosEmergencia from "./steps/Step6DatosEmergencia";
import Step7Visibilidad from "./steps/Step7Visibilidad";

const STEP_COMPONENTS = [
  Step1DatosGenerales,
  Step2Contacto,
  Step3Ubicacion,
  Step4PerfilProfesional,
  Step5ServiciosProfesionales,
  Step6DatosEmergencia,
  Step7Visibilidad,
];

const LAST_STEP = FORM_STEPS.length - 1;
const SUBMIT_ENDPOINT = "/api/afiliados/solicitudes/";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function RegistroForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const schema = useMemo(
    () => buildRegistroSchema({ checkImageDimensions: getImageDimensions }),
    [],
  );

  const methods = useForm<RegistroFormInput, unknown, RegistroFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: registroDefaultValues,
    mode: "onChange",
    reValidateMode: "onChange"});

  const { trigger, handleSubmit, getFieldState, formState } = methods;
  const { isValid } = formState;

  const stepHasError = (index: number) =>
    STEP_FIELDS[index].some((field) => getFieldState(field, formState).invalid);

  const stepStatus = FORM_STEPS.map((_, index) => {
    if (index === currentStep) return "current" as const;
    if (stepHasError(index)) return "error" as const;
    if (index <= furthestStep) return "complete" as const;
    return "pending" as const;
  });

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToStep = (index: number) => {
    if (index > furthestStep) return; // solo se puede saltar a pasos ya alcanzados
    setCurrentStep(index);
    scrollToTop();
  };

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
    if (!isValid) return;
    const next = Math.min(currentStep + 1, LAST_STEP);
    setCurrentStep(next);
    setFurthestStep((prev) => Math.max(prev, next));
    scrollToTop();
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    scrollToTop();
  };

  useEffect(() => {
    if (currentStep === LAST_STEP) {
      trigger();
    }
  }, [currentStep, trigger]);

  const onInvalid = () => {
    const stepWithError = STEP_FIELDS.findIndex((fields) =>
      fields.some((field) => getFieldState(field, formState).invalid),
    );

    if (stepWithError !== -1) {
      setCurrentStep(stepWithError);
      setFurthestStep((prev) => Math.max(prev, stepWithError));
      scrollToTop();
    }

    setSubmitStatus("error");
    setSubmitError(
      "Hay campos obligatorios sin completar o con errores. Revisa los pasos marcados.",
    );
  };

  const onSubmit = async (values: RegistroFormOutput) => {
    setSubmitStatus("submitting");
    setSubmitError(null);

    try {
      const formData = buildRegistroFormData(values);

      const response = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        body: formData});

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(
          body?.message ??
            "No se pudo completar el registro. Intenta de nuevo.",
        );
      }

      setSubmitStatus("success");
      scrollToTop();
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado.",
      );
    }
  };

  const StepComponent = STEP_COMPONENTS[currentStep];

  if (submitStatus === "success") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#004B87]" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          ¡Registro enviado!
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Gracias por afiliarte a la Red de Egresados de Posgrado del TecNM.
          Revisaremos tu información y te contactaremos por correo electrónico.
        </p>
      </div>
    );
  }

  return (
    <div ref={topRef} className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <StepIndicator
          steps={FORM_STEPS}
          currentStep={currentStep}
          furthestStep={furthestStep}
          onStepClick={goToStep}
          stepStatus={stepStatus}
        />
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className="space-y-6"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 font-display text-lg font-semibold text-slate-900">
              {FORM_STEPS[currentStep]}
            </h2>
            <StepComponent />
          </div>

          {submitStatus === "error" && submitError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{submitError}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || submitStatus === "submitting"}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </button>

            {currentStep < LAST_STEP ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-lg bg-[#004B87] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#003A68]"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitStatus === "submitting" || !isValid}
                className="flex items-center gap-1.5 rounded-lg bg-[#004B87] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#003A68] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitStatus === "submitting" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {submitStatus === "submitting"
                  ? "Enviando…"
                  : "Enviar registro"}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
