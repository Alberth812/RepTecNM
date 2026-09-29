"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import {
  buildRegistroSchema,
  registroDefaultValues,
  RegistroFormInput,
  RegistroFormOutput,
  STEP_FIELDS,
} from "@/lib/registro/schema";
import { buildRegistroFormData } from "@/lib/registro/formData";
import { getImageDimensions } from "@/lib/registro/validators";
import { urlToFile } from "@/lib/registro/prefill";
import { FORM_STEPS } from "@/lib/registro/types";
import StepIndicator from "./StepIndicator";
import Step1DatosGenerales from "./steps/Step1DatosGenerales";
import Step2Contacto from "./steps/Step2Contacto";
import Step3Ubicacion from "./steps/Step3Ubicacion";
import Step4PerfilProfesional from "./steps/Step4PerfilProfesional";
import Step5ServiciosProfesionales from "./steps/Step5ServiciosProfesionales";
import Step6DatosEmergencia from "./steps/Step6DatosEmergencia";
import Step7Visibilidad from "./steps/Step7Visibilidad";
import RegistroEnviado from "./ui/RegistroEnviado";

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
const SUBMIT_ENDPOINT = "/api/form-registro";

type SubmitStatus = "idle" | "submitting" | "success" | "error";
type PrefillStatus = "idle" | "loading" | "done" | "error";

type ArchivoActualRef = { originalName: string; url: string };

interface RegistroFormProps {
  initialData?: Omit<RegistroFormInput, "fotografia" | "comprobante_membresia">;
  observaciones?: string | null;
  archivosActuales?: {
    fotografia: ArchivoActualRef;
    comprobanteMembresia: ArchivoActualRef;
  } | null;
}

export default function RegistroForm({
  initialData,
  observaciones,
  archivosActuales,
}: RegistroFormProps = {}) {
  const esCorreccion = initialData !== undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(
    esCorreccion ? LAST_STEP : 0,
  );
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prefillStatus, setPrefillStatus] = useState<PrefillStatus>(
    archivosActuales ? "loading" : "idle",
  );
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const schema = useMemo(
    () => buildRegistroSchema({ checkImageDimensions: getImageDimensions }),
    [],
  );

  const defaultValues = useMemo(
    () =>
      initialData
        ? { ...registroDefaultValues, ...initialData }
        : registroDefaultValues,
    [initialData],
  );

  const methods = useForm<RegistroFormInput, unknown, RegistroFormOutput>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { trigger, handleSubmit, getFieldState, formState, setValue } = methods;
  const { isValid } = formState;

  useEffect(() => {
    if (esCorreccion) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Precarga la fotografía y el comprobante del envío anterior (si existen)
  // para que el afiliado no tenga que descargarlos y volver a subirlos a
  // mano. Si la descarga falla (URL firmada vencida, red, CORS, etc.) se
  // deja constancia del error; el afiliado siempre puede usar los enlaces
  // de solo lectura para revisarlos y subirlos manualmente.
  useEffect(() => {
    if (!archivosActuales) return;

    let cancelled = false;
    setPrefillStatus("loading");
    setPrefillError(null);

    (async () => {
      const [fotoResult, comprobanteResult] = await Promise.allSettled([
        urlToFile(
          archivosActuales.fotografia.url,
          archivosActuales.fotografia.originalName,
        ),
        urlToFile(
          archivosActuales.comprobanteMembresia.url,
          archivosActuales.comprobanteMembresia.originalName,
        ),
      ]);

      if (cancelled) return;

      if (fotoResult.status === "fulfilled") {
        setValue("fotografia", fotoResult.value, {
          shouldValidate: true,
          shouldDirty: false,
        });
      }

      if (comprobanteResult.status === "fulfilled") {
        setValue("comprobante_membresia", comprobanteResult.value, {
          shouldValidate: true,
          shouldDirty: false,
        });
      }

      if (
        fotoResult.status === "rejected" ||
        comprobanteResult.status === "rejected"
      ) {
        setPrefillStatus("error");
        setPrefillError(
          "No se pudieron precargar automáticamente uno o ambos archivos anteriores. Usa los enlaces de arriba para revisarlos y vuelve a subirlos manualmente en el paso 1.",
        );
      } else {
        setPrefillStatus("done");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archivosActuales]);

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
    if (index > furthestStep) return;
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
        body: formData,
      });

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
    return <RegistroEnviado />;
  }

  return (
    <div ref={topRef} className="mx-auto max-w-2xl">
      {observaciones && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">
              El administrador solicitó correcciones:
            </p>
            <p className="mt-1">{observaciones}</p>
          </div>
        </div>
      )}

      {archivosActuales && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="flex items-start gap-2.5">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-700">
                Archivos de tu envío anterior
              </p>

              {prefillStatus === "loading" && (
                <p className="mt-1 flex items-center gap-1.5 text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Precargando tu fotografía y comprobante anteriores…
                </p>
              )}

              {prefillStatus === "done" && (
                <p className="mt-1">
                  Ya precargamos tu fotografía y tu comprobante de membresía
                  anteriores en el paso 1. Puedes dejarlos igual o reemplazarlos
                  si lo necesitas.
                </p>
              )}

              {prefillStatus === "error" && (
                <p className="mt-1 text-amber-700">{prefillError}</p>
              )}

              <ul className="mt-2 space-y-1">
                <li>
                  <a
                    href={archivosActuales.fotografia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#004B87] underline underline-offset-2"
                  >
                    Ver fotografía enviada (
                    {archivosActuales.fotografia.originalName})
                  </a>
                </li>

                <li>
                  <a
                    href={archivosActuales.comprobanteMembresia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#004B87] underline underline-offset-2"
                  >
                    Ver comprobante enviado (
                    {archivosActuales.comprobanteMembresia.originalName})
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

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

            <div className="flex items-center gap-3">
              {esCorreccion && currentStep < LAST_STEP && (
                <button
                  type="submit"
                  disabled={submitStatus === "submitting" || !isValid}
                  className="flex items-center gap-1.5 rounded-lg border border-[#004B87] px-4 py-2.5 text-sm font-medium text-[#004B87] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitStatus === "submitting" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Reenviar solicitud
                </button>
              )}

              {currentStep < LAST_STEP ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitStatus === "submitting"}
                  className="flex items-center gap-1.5 rounded-lg bg-[#004B87] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#003A68] disabled:cursor-not-allowed disabled:opacity-60"
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
                    : esCorreccion
                      ? "Reenviar solicitud"
                      : "Enviar registro"}
                </button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
