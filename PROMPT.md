Tengo los siguientes requisitos funcionales para implementar una REST API de autenticación en Next.js usando API Routes y la la librería better-auth. Los requisitos son los siguientes.

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

- **RF-AUTH-012 — Cambio de correo de inicio de sesión.** Un afiliado puede cambiar su correo de inicio de sesión. El proceso es autogestionado: requiere introducir la contraseña actual y confirmar un código de seis dígitos enviado al nuevo correo. Una vez confirmado, el nuevo correo sustituye al anterior para el inicio de sesión.

### 3.4 Cuentas administrativas

- **RF-AUTH-013 — Creación de cuentas ADMINISTRADOR.** No existe registro público para el rol ADMINISTRADOR. Durante el despliegue inicial del sistema se crea mediante un procedimiento seguro (seed) una cuenta ADMINISTRADOR con subtipo **GENERAL** y atributo `is_root = true`, denominada administrador raíz. A partir de ese momento, cualquier administrador con subtipo **GENERAL** puede crear nuevas cuentas ADMINISTRADOR, asignándoles nombre, correo electrónico (registrado con `email_verified = TRUE` porque no necesita verificarse; además este correo es único en todo el sistema), contraseña y subtipo (`GENERAL` o `CONTENIDO`). El atributo `is_root` no puede asignarse mediante funcionalidades de la aplicación.

Cuando un administrador inicia sesión se muestra que "Bienvenido <correo>. Eres administrador. Tu tipo es <tipo>". Las cuentas de administrador no tienen asociado un `membership_status` (vease la sección 3.6).

- **RF-AUTH-014 — Eliminación de cuentas ADMINISTRADOR.** Un administrador con subtipo **CONTENIDO** puede ser eliminado por cualquier administrador con subtipo **GENERAL**. Un administrador con subtipo **GENERAL** solo puede ser eliminado por el administrador raíz (`is_root = true`). Un administrador no puede eliminar su propia cuenta. En caso de pérdida de acceso al administrador raíz, su recuperación se realizará exclusivamente mediante un procedimiento de administración del sistema fuera de la aplicación (por ejemplo, un script o comandos SQL de recuperación ejecutado por un operador con acceso a la infraestructura).

- **RF-AUTH-015 — Permisos por subtipo de administrador.** Toda cuenta `ADMINISTRADOR` tiene asignado un subtipo (`GENERAL` o `CONTENIDO`).

## 3.5 Protección contra abuso, rate limiting y códigos de verificación

Aprovecha los mecanismos de rate limites disponibles en Better Auth y su plugin Email OTP. También puedes implementar cuestiones de rate limit propias para cosas específicas.

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

Sin embargo, better auth ya tiene su propia tabla `account`, entonces puedes descartar/eliminar la que te proporcioné, solo recuerda definir bien las relaciones. En particular, el esquema generado por better auth al instalarlo es

```ts
import { defineRelationsPart } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("accounts_issuer_accountId_uidx").on(
      table.issuer,
      table.accountId,
    ),
    index("accounts_userId_idx").on(table.userId),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const authRelations = defineRelationsPart(
  { users, sessions, accounts, verifications },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
  }),
);
```

## Lo que quiero

Lo que necesito es que implementes este mecanismo de autenticación en una REST API en Next.js así como los componentes React necesarios para realizar las acciones descritas.

## Tecnologías

Debes usar better usando su plugin de Email OTP, pero puedes usar más plugins que tiene. Puedes usar cualquier otro libería para lo que quieras. Prácticamente better auth ya tiene mucho para la mayoría de las cosas que queremos

- Sign Up
- Sign In
- Sign Out
- Email Verification
- Request Password Reset
- Update password

Y su plugin "Email OTP" tiene varias cosas útiles como:

- Send an OTP
- Check an OTP
- Sign In with OTP
- Verify Email with OTP
- Change Email with OTP
- Override Default Email Verification

Debes usar tailwind css para el frontend.

Asume un método sencillo para enviar emails (usaré Mailtrap).

Recuerda que estamos usando Drizzle ORM v1.0 usando Postgres.

Recuerda seguir buenas prácticas y favorecer el desacoplamiento.
