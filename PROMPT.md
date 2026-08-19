Tengo los siguientes requisitos funcionales para implementar una REST API de autenticación en Next.js (usando API Routes)

## 3. Autenticación y Gestión de Cuentas (RF-AUTH)

El sistema reconoce dos roles de cuenta: AFILIADO y ADMINISTRADOR. El rol ADMINISTRADOR tiene dos subtipos definidos por un atributo de la cuenta: Administrador General y Administrador de Contenido.

### 3.1 Registro y verificación de correo electrónico

- **RF-AUTH-001 — Registro de cuenta.** Cualquier persona puede crear una cuenta con rol `AFILIADO` proporcionando un correo electrónico y una contraseña que cumpla la política de RF-AUTH-010. Al crearse, la cuenta queda con `email_verified = FALSE`. Mientras el correo no esté verificado, la cuenta no permite el inicio de sesión bajo ninguna circunstancia. Las cuentas con rol `ADMINISTRADOR` no se crean por este medio (ver RF-AUTH-013).
- **RF-AUTH-002 — Envío y vigencia del desafío de verificación.**
  Al registrarse (RF-AUTH-001) o al solicitar un reenvío (RF-AUTH-003), el sistema envía al correo un un código de seis (6) dígitos, generados como un mismo desafío de verificación, con vigencia de 15 minutos desde su emisión. El usuario puede verificar su correo introduciendo el código correcto. Al verificarse correctamente: `email_verified` pasa a `TRUE`, se crea el perfil de afiliado asociado, y su `membership_status` inicia en `NO_INICIADA` (RF-MEMB-001).
- **RF-AUTH-003 — Reenvío del desafío de verificación.**
  Mientras `email_verified = FALSE`, el usuario puede solicitar el reenvío del desafío respetando un intervalo mínimo de 120 segundos entre solicitudes. Cada reenvío genera un nuevo enlace y código, ambos con nueva vigencia de 15 minutos, e invalida de inmediato el enlace y código emitidos previamente.
- **RF-AUTH-004 — Desafío expirado o inválido.**
  Si el usuario intenta verificar su correo con un enlace o código expirado, ya invalidado por un reenvío posterior, o incorrecto, el sistema rechaza la operación e indica que debe solicitar un nuevo código (RF-AUTH-003).
- **RF-AUTH-005 — Registro con correo ya existente.**
  Si el correo proporcionado en RF-AUTH-001 ya pertenece a otra cuenta (ya sea de un afiliado o administrador), el sistema no crea una cuenta duplicada y distingue dos casos:
  a) **Verificación pendiente** (`email_verified = FALSE`): el sistema informa que ya existe un registro pendiente de verificación para ese correo y ofrece reenviar el desafío (RF-AUTH-003), en lugar de crear una cuenta nueva. El ofrecimiento de reenviar el desafío se hace siempre y cuando no hayan pasado los 120 segundos.
  b) **Correo ya verificado** (`email_verified = TRUE`): el sistema responde con el mensaje _"Este correo ya está registrado"_.
- **RF-AUTH-006 — Acceso tras verificar el correo.**
  Una vez `email_verified = TRUE`, el usuario puede iniciar sesión y acceder a un componente Home que simplemente muestra "Bienvenido <correo_electronico>. Tu estado de afiliación es <membership_status>". Recuerda que inmediatamente después de la verificación el estado de `membership_status` es `NO_INICIADA`.

### 3.2 Acceso y sesión

- **RF-AUTH-007 — Validación de acceso según estado de afiliación.** En cada inicio de sesión de una cuenta `AFILIADO`, el sistema muestra `membership_status`. Esta validación no aplica a cuentas `ADMINISTRADOR`, cuyo acceso se rige por su subtipo (RF-AUTH-015).
- **RF-AUTH-008 — Expiración de sesión.** La sesión de cualquier cuenta (`AFILIADO` o `ADMINISTRADOR`) expira automáticamente tras 30 días de inactividad y exige reautenticación. El cierre de sesión manual está disponible en cualquier momento.

### 3.3 Contraseña y datos de acceso

- **RF-AUTH-010 — Política de contraseña.** Toda contraseña, tanto en el registro como en cualquier cambio posterior, debe tener mínimo 8 caracteres e incluir al menos una mayúscula, un número y un símbolo.
- **RF-AUTH-011 — Recuperación de contraseña.** El sistema permite recuperar la contraseña mediante un enlace de un solo uso enviado al correo registrado, con vigencia de 15 minutos. Reglas aplicables:

  Cada cuenta puede solicitar la recuperación hasta 5 veces dentro de un período de 7 días, contado desde la primera solicitud de ese período; transcurridos los 7 días, el contador se reinicia.

  Si la cuenta está en `membership_status` `RECHAZADO` o `SUSPENDIDO` o si su correo no ha sido verificado `email_verified = FALSE`, el sistema no genera ni envía el enlace. _(Una cuenta en `BAJA` ya no existe como tal, por lo que ese caso queda cubierto de forma natural por "la cuenta no existe", sin necesidad de una regla aparte. Por otro lado, un correo no verificado no tiene una cuenta asociada así que no tiene sentido que recuperar contraseña funcione y el no mostrar un mensaje de que su correo está en proceso de verificación es deliberado)._

  Independientemente de si el correo existe, de si la cuenta existe o de su estado, el sistema siempre muestra: _"Si existe una cuenta asociada a este correo, se enviará un correo electrónico para recuperar la contraseña."_ Esta respuesta uniforme evita revelar la existencia o el estado de una cuenta **a través de este flujo en particular**; no es una garantía general anti-enumeración, ya que el flujo de registro (RF-AUTH-005) sí puede revelar si un correo está en uso.

- **RF-AUTH-012 — Cambio de correo de inicio de sesión.** Un afiliado puede cambiar su correo de inicio de sesión. El proceso es autogestionado: requiere introducir la contraseña actual y confirmar un código de seis dígitos enviado al nuevo correo. Una vez confirmado, el nuevo correo sustituye al anterior para el inicio de sesión. Además, se notifica al correo _anterior_ que hubo un cambio.

### 3.4 Cuentas administrativas

- **RF-AUTH-013 — Creación de cuentas ADMINISTRADOR.** No existe registro público para el rol ADMINISTRADOR. Durante el despliegue inicial del sistema se crea mediante un procedimiento seguro (seed) una cuenta ADMINISTRADOR con subtipo **GENERAL** y atributo `is_root = true`, denominada administrador raíz. A partir de ese momento, cualquier administrador con subtipo **GENERAL** puede crear nuevas cuentas ADMINISTRADOR, asignándoles nombre, correo electrónico (registrado con `email_verified = TRUE` porque no necesita verificarse; además este correo es único en todo el sistema), contraseña y subtipo (`GENERAL` o `CONTENIDO`). El atributo `is_root` no puede asignarse mediante funcionalidades de la aplicación.

Cuando un administrador inicia sesión se muestra que "Bienvenido <correo>. Eres administrador. Tu tipo es <tipo>". Las cuentas de administrador no tienen asociado un `membership_status` (vease la sección 3.6).

- **RF-AUTH-014 — Eliminación de cuentas ADMINISTRADOR.** Un administrador con subtipo **CONTENIDO** puede ser eliminado por cualquier administrador con subtipo **GENERAL**. Un administrador con subtipo **GENERAL** solo puede ser eliminado por el administrador raíz (`is_root = true`). Un administrador no puede eliminar su propia cuenta. En caso de pérdida de acceso al administrador raíz, su recuperación se realizará exclusivamente mediante un procedimiento de administración del sistema fuera de la aplicación (por ejemplo, un script o comandos SQL de recuperación ejecutado por un operador con acceso a la infraestructura).

- **RF-AUTH-015 — Permisos por subtipo de administrador.** Toda cuenta `ADMINISTRADOR` tiene asignado un subtipo (`GENERAL` o `CONTENIDO`).

## 3.5 Protección contra abuso, rate limiting y códigos de verificación

Con el propósito de evitar abuso de los mecanismos de autenticación, generación de códigos, recuperación de contraseña y envío de correos electrónicos, el sistema deberá aplicar límites de frecuencia tanto por dirección IP como por cuenta, correo electrónico u otro identificador disponible.

- **RF-AUTH-016 — Rate limiting de solicitudes de autenticación.**
  Los endpoints relacionados con registro, inicio de sesión, reenvío de desafíos, verificación de correo, recuperación de contraseña, cambio de correo y cualquier otra operación sensible de autenticación deberán estar protegidos mediante mecanismos de rate limiting. El límite deberá considerar como mínimo la dirección IP de origen y, cuando sea posible, la cuenta o correo electrónico involucrado.

- **RF-AUTH-017 — Límite de solicitudes de registro por IP.**
  El endpoint de registro deberá limitar la cantidad de cuentas que pueden intentarse crear desde una misma dirección IP dentro de una ventana de tiempo determinada. Al superar el límite, el sistema deberá rechazar temporalmente nuevas solicitudes y responder con HTTP `429 Too Many Requests`.

- **RF-AUTH-018 — Límite de generación y reenvío de desafíos de verificación.**
  Una cuenta con `email_verified = FALSE` deberá respetar un intervalo mínimo de 120 segundos entre solicitudes de reenvío, conforme a RF-AUTH-003. Adicionalmente, el sistema deberá establecer un límite máximo de desafíos de verificación que pueden generarse para una misma cuenta dentro de una ventana de tiempo determinada.

  Este límite deberá existir incluso cuando se respete correctamente el intervalo de 120 segundos, con el objetivo de impedir el abuso sistemático del servicio de correo. Más adelante, definiré una política de depuración de cuentas; si el correo no ha sido verificado 7 días después del registro, la cuenta se elimina automáticamente y el correo queda disponible para un nuevo registro.

- **RF-AUTH-019 — Límite de generación de desafíos por dirección IP.**
  Independientemente del límite asociado a una cuenta, el sistema deberá limitar la cantidad total de desafíos de verificación que pueden solicitarse desde una misma dirección IP dentro de una ventana de tiempo determinada. Esto evita utilizar una misma IP para generar grandes cantidades de correos dirigidos a diferentes cuentas.

- **RF-AUTH-020 — Límite de intentos de validación de código de verificación.**
  El código de verificación de seis dígitos deberá contar con un número máximo de intentos de validación fallidos. Cuando se alcance dicho límite, el desafío deberá invalidarse inmediatamente, aun cuando no haya transcurrido su vigencia de 15 minutos, y el usuario deberá solicitar un nuevo desafío.

- **RF-AUTH-021 — Uso único del código de verificación.**
  Un código de verificación solo podrá utilizarse una vez. Una vez validado correctamente, deberá quedar invalidado permanentemente y no podrá reutilizarse para verificar nuevamente el mismo correo.

- **RF-AUTH-022 — Invalidez de desafíos anteriores.**
  Cuando se genere un nuevo desafío de verificación, deberán invalidarse inmediatamente todos los desafíos anteriores asociados a la misma cuenta. En consecuencia, únicamente el desafío más reciente podrá utilizarse para completar la verificación.

- **RF-AUTH-023 — Límite de solicitudes de recuperación de contraseña.**
  Además de la restricción funcional definida en RF-AUTH-011 de un máximo de 5 solicitudes dentro de un período de 7 días, el endpoint de recuperación de contraseña deberá contar con rate limiting adicional por dirección IP. El límite por IP deberá aplicarse independientemente de que el correo proporcionado exista o no en el sistema.

- **RF-AUTH-024 — Límite de intentos de uso del enlace de recuperación.**
  El enlace de recuperación de contraseña deberá ser de un solo uso. Una vez utilizado correctamente, deberá invalidarse inmediatamente. Los intentos inválidos, manipulados, expirados o ya utilizados deberán ser rechazados y no deberán permitir reutilizar el mismo enlace.

- **RF-AUTH-025 — Límite de intentos de inicio de sesión.**
  El endpoint de inicio de sesión deberá limitar los intentos fallidos de autenticación. El límite deberá considerar como mínimo la cuenta y la dirección IP, aplicando un mecanismo progresivo de bloqueo o backoff cuando se detecten múltiples intentos fallidos consecutivos.

- **RF-AUTH-026 — Protección contra abuso distribuido.**
  Los límites no deberán depender exclusivamente de la dirección IP, ya que un atacante puede distribuir solicitudes entre múltiples direcciones. Para operaciones sensibles, el sistema deberá combinar al menos dos dimensiones de control, por ejemplo:
  - dirección IP;
  - correo electrónico o identificador de cuenta;
  - dispositivo o identificador de cliente, cuando sea viable.

- **RF-AUTH-027 — Respuesta ante superación de límites.**
  Cuando una solicitud sea rechazada por exceder un rate limit, el sistema deberá responder con HTTP `429 Too Many Requests`. Cuando corresponda, deberá incluir información que permita al cliente conocer el tiempo mínimo antes de intentar nuevamente, por ejemplo mediante el encabezado `Retry-After`.

- **RF-AUTH-028 — Protección del servicio de correo.**
  El sistema deberá limitar globalmente la cantidad de correos electrónicos relacionados con autenticación que pueden enviarse durante un período determinado. Este límite deberá aplicarse además de los límites por cuenta e IP, con el objetivo de evitar que la plataforma sea utilizada como mecanismo de envío masivo de correos no solicitados.

- **RF-AUTH-029 — No almacenamiento de OTP en texto plano.**
  Los códigos de verificación y demás secretos temporales utilizados para autenticación no deberán almacenarse en texto plano en la base de datos. El sistema deberá almacenar únicamente una representación segura que permita verificar el código introducido sin revelar el valor original en caso de acceso no autorizado a la base de datos.

- **RF-AUTH-030 — Invalidación por expiración.**
  Todo desafío de verificación o recuperación deberá quedar invalidado automáticamente al alcanzar su tiempo de vigencia. Un desafío expirado no podrá utilizarse aunque no haya alcanzado su máximo de intentos.

- **RF-AUTH-031 — Rate limiting independiente por endpoint.**
  Los límites deberán definirse de forma independiente según el riesgo y costo de la operación. No deberá existir necesariamente un único límite global para todos los endpoints de autenticación. Las operaciones de mayor impacto, especialmente aquellas que generan correos o permiten validar secretos, deberán contar con restricciones más estrictas.

## 3.6 Sobre las relaciones entre cuentas (accounts), afiliados y administradores.

De momento, tengo definida una cuenta de la siguiente forma

```ts
export const accountRoleEnum = pgEnum("account_role", [
  "AFILIADO",
  "ADMINISTRADOR",
]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),

  email: text("email").notNull(),

  passwordHash: text("password_hash").notNull(),

  role: accountRoleEnum("role").notNull(),

  emailStatus: boolean("email_verified").notNull().default(false),

  emailVerifiedAt: timestamp("email_verified_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
```

Mientras que administrador se define como

```ts
export const adminSubtypeEnum = pgEnum("admin_subtype", [
  "GENERAL",
  "CONTENIDO",
]);

export const administradores = pgTable("administradores", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id, {
      onDelete: "cascade",
    }),

  nombreCompleto: text("nombre_completo").notNull(),

  subtype: adminSubtypeEnum("subtype").notNull(),

  isRoot: boolean("is_root").notNull().default(false),
});
```

Y afiliado se define así

```ts
export const membershipStatusEnum = pgEnum("membership_status", [
  "NO_INICIADA",
  "PENDIENTE_APROBACION",
  "REQUIERE_CORRECCION",
  "RECHAZADO",
  "ACTIVO",
  "INACTIVO",
  "SUSPENDIDO",
  "BAJA",
]);

/**
 * Datos "públicos" del afiliado: lo que puede mostrarse en el catálogo de
 * egresados (sujeto a `autoriza_publicacion` / `datos_publicos`).
 */
export const afiliados = pgTable("afiliados", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id, {
      onDelete: "cascade",
    }),
  // Datos generales
  apellidoPaterno: text("apellido_paterno").notNull(),
  apellidoMaterno: text("apellido_materno").notNull(),
  nombres: text("nombres").notNull(),
  fotografiaUrl: text("fotografia_url").notNull(),
  comprobanteMembresiaUrl: text("comprobante_membresia_url"),
  genero: text("genero").notNull(),

  //Estado de membresía
  membershipStatus: membershipStatusEnum("membership_status")
    .notNull()
    .default("NO_INICIADA"),

  // (otros campos)

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
```

Por otro lado, sus relaciones son las siguientes

```ts
import { defineRelations } from "drizzle-orm";
import { accounts } from "./accounts/schema";
import { administradores } from "./admins/schema";
import { afiliados } from "./afiliados/schema";

export const relations = defineRelations(
  {
    afiliados,
    accounts,
    administradores,
  },
  (r) => ({
    accounts: {
      administrator: r.one.administradores({
        from: r.accounts.id,
        to: r.administradores.accountId,
      }),

      affiliate: r.one.afiliados({
        from: r.accounts.id,
        to: r.afiliados.accountId,
      }),
    },

    administradores: {
      account: r.one.accounts({
        from: r.administradores.accountId,
        to: r.accounts.id,
      }),
    },

    afiliados: {
      account: r.one.accounts({
        from: r.afiliados.accountId,
        to: r.accounts.id,
      }),
    },
  }),
);
```

## Lo que quiero

Lo que necesito es que implementes este mecanismo de autenticación en una REST API en Next.js así como los componentes React necesarios para realizar las acciones descritas.

De todas formas te doy una separación o catalogo de acciones como recordatorio. Puedes agregar más según necesites o consideres.

### Usuario no autenticado

Acciones públicas:

| Acción                               | Componente/pantalla   | API                                  |
| ------------------------------------ | --------------------- | ------------------------------------ |
| Registrarse como afiliado            | `/signup`             | `POST /api/auth/register`            |
| Verificar correo mediante código     | `/verificar-email`    | `POST /api/auth/verify-email`        |
| Solicitar reenvío de código          | `/verificar-email`    | `POST /api/auth/resend-verification` |
| Iniciar sesión                       | `/login`              | `POST /api/auth/login`               |
| Solicitar recuperación de contraseña | `/recuperar-password` | `POST /api/auth/forgot-password`     |

### Usuarios autenticados

Una vez autenticado, aparecen varias acciones distintas.

#### Cuenta / autenticación

| Acción                 | Componente                 | API                           |
| ---------------------- | -------------------------- | ----------------------------- |
| Ver sesión actual      | provider/context de sesión | `GET /api/auth/session`       |
| Cerrar sesión          | botón/logout               | `POST /api/auth/logout`       |
| Cambiar contraseña     | `/perfil/seguridad`        | `POST/PATCH /api/me/password` |
| Cambiar correo         | `/perfil/seguridad`        | `POST /api/me/email/change`   |
| Confirmar nuevo correo | Va junto con el anterior   | `POST /api/me/email/confirm`  |

#### Perfil y registro. Solo afiliados

| Acción                         | Componente | API                      |
| ------------------------------ | ---------- | ------------------------ |
| Consultar mi perfil            | `/perfil`  | `GET /api/me`            |
| Consultar estado de afiliación | dashboard  | `GET /api/me/membership` |

### Administrador

### Administrador general

### Gestión de afiliados

| Acción                   | Componente              | API                             |
| ------------------------ | ----------------------- | ------------------------------- |
| Listar afiliados         | `/admin/afiliados`      | `GET /api/admin/affiliates`     |
| Buscar/filtrar afiliados | misma pantalla          | `GET /api/admin/affiliates?...` |
| Ver afiliado             | `/admin/afiliados/[id]` | `GET /api/admin/affiliates/:id` |

---

### Gestión de administradores

| Acción                         | Componente                     | API                            |
| ------------------------------ | ------------------------------ | ------------------------------ |
| Listar administradores         | `/admin/administradores`       | `GET /api/admin/admins`        |
| Ver administrador              | `/admin/administradores/[id]`  | `GET /api/admin/admins/:id`    |
| Crear administrador            | `/admin/administradores/nuevo` | `POST /api/admin/admins`       |
| Eliminar administrador         | detalle                        | `DELETE /api/admin/admins/:id` |
| Cambiar datos de administrador | detalle                        | `PATCH /api/admin/admins/:id`  |

La autorización debe estar en el backend:

- `GENERAL` puede crear administradores.
- `GENERAL` puede eliminar `CONTENIDO`.
- `ROOT` puede eliminar `GENERAL`.
- nadie puede eliminarse a sí mismo.
- nadie puede asignarse `is_root`.

### Administrador de contenido

Solo ve página de bienvenida

Ambos administradores (general y contenido) pueden hacer acciones de Cuenta / autenticación.

### Acciones automáticas del sistema

Hay procesos que debe ejecutar el sistema:

| Acción                                      | Ejecución           |
| ------------------------------------------- | ------------------- |
| Expirar desafío de verificación             | automática          |
| Invalidar OTP anterior                      | automática          |
| Expirar tokens de recuperación              | automática          |
| Expirar sesión por inactividad              | middleware/servicio |
| Enviar correo de verificación               | servicio            |
| Enviar correo de recuperación de contraseña | servicio            |
| Notificar cambio de correo                  | servicio            |

## Tecnologías

Puedes ocupar cualquier librería para cualquier cosa. Por ejemplo, puedes usar better auth con su integración de jwt (cookies), OTP y sus demás cosas que tiene. Puedes usar lo que quieras.

Asume un método sencillo (to, from, text) para enviar emails (usaré Mailtrap). Recuerda que estamos usando Drizzle ORM v1.0 (usando Postgres en Neon).

Recuerda seguir buenas prácticas y favorecer el desacoplamiento.
