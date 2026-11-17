"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
 INTERESADO_EN_OPTIONS,
 MODALIDAD_SERVICIOS_OPTIONS,
 RegistroFormValues,
 SECTORES_OPTIONS,
 TIPO_SERVICIOS_OPTIONS,
} from "./types";
import TextInput from "@/components/afilliate/registro/ui/TextInput";
import TextArea from "@/components/afilliate/registro/ui/TextArea";
import CheckboxGroup from "@/components/afilliate/registro/ui/CheckboxGroup";

const OTRO = "Otro (especifique)";

export default function Step5ServiciosProfesionales() {
 const {
 register,
 control,
 watch,
 formState: { errors },
 } = useFormContext<RegistroFormValues>();

 const tipoServicios = watch("tipo_servicios");
 const sectores = watch("sectores");
 const interesadoEn = watch("interesado_en");
 const descripcionServicios = watch("descripcion_servicios");

 return (
 <div className="space-y-5">
 <Controller
 name="tipo_servicios"
 control={control}
 render={({ field }) => (
 <CheckboxGroup
 label="Tipo de servicios"
 required
 options={TIPO_SERVICIOS_OPTIONS}
 value={field.value}
 onChange={field.onChange}
 error={errors.tipo_servicios?.message}
 />
 )}
 />
 {tipoServicios?.includes(OTRO) && (
 <TextInput
 label="Especifica el tipo de servicio"
 required
 {...register("tipo_servicios_otro")}
 error={errors.tipo_servicios_otro?.message}
 />
 )}

 <TextArea
 label="Descripción detallada de servicios"
 required
 maxWords={300}
 maxChars={500}
 currentValue={descripcionServicios}
 rows={5}
 {...register("descripcion_servicios")}
 error={errors.descripcion_servicios?.message}
 />

 <Controller
 name="sectores"
 control={control}
 render={({ field }) => (
 <CheckboxGroup
 label="Sectores a los que van dirigidos los servicios"
 required
 options={SECTORES_OPTIONS}
 value={field.value}
 onChange={field.onChange}
 error={errors.sectores?.message}
 />
 )}
 />
 {sectores?.includes(OTRO) && (
 <TextInput
 label="Especifica el sector"
 required
 {...register("sectores_otro")}
 error={errors.sectores_otro?.message}
 />
 )}

 <Controller
 name="modalidad_servicios"
 control={control}
 render={({ field }) => (
 <CheckboxGroup
 label="Modalidad de servicios"
 required
 columns={1}
 options={MODALIDAD_SERVICIOS_OPTIONS}
 value={field.value}
 onChange={field.onChange}
 error={errors.modalidad_servicios?.message}
 />
 )}
 />

 <Controller
 name="interesado_en"
 control={control}
 render={({ field }) => (
 <CheckboxGroup
 label="Interesado en"
 required
 options={INTERESADO_EN_OPTIONS}
 value={field.value}
 onChange={field.onChange}
 error={errors.interesado_en?.message}
 />
 )}
 />
 {interesadoEn?.includes(OTRO) && (
 <TextInput
 label="Especifica en qué más te interesa participar"
 required
 {...register("interesado_en_otro")}
 error={errors.interesado_en_otro?.message}
 />
 )}
 </div>
 );
}
