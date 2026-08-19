## 3. Autenticación y Gestión de Cuentas (RF-AUTH)

### 3.1 Registro y verificación de correo electrónico

- **RF-AUTH-001 — Registro de cuenta.** Cualquier persona puede crear una cuenta con rol `AFILIADO` proporcionando un correo electrónico y una contraseña que cumpla la política de RF-AUTH-010. Al crearse, la cuenta queda con `email_status = NO_VERIFICADO`. Mientras el correo no esté verificado, la cuenta no permite el inicio de sesión bajo ninguna circunstancia. Las cuentas con rol `ADMINISTRADOR` no se crean por este medio (ver RF-AUTH-013).
- **RF-AUTH-002 — Envío y vigencia del desafío de verificación.**
  Al registrarse (RF-AUTH-001) o al solicitar un reenvío (RF-AUTH-003), el sistema envía al correo un enlace de activación y un código de seis (6) dígitos, generados como un mismo desafío de verificación, con vigencia de 60 minutos desde su emisión. El usuario puede verificar su correo con cualquiera de los dos medios indistintamente. Al verificarse correctamente: `email_status` pasa a `VERIFICADO`, se crea el perfil de afiliado asociado, y su `membership_status` inicia en `NO_INICIADA` (RF-MEMB-001).
- **RF-AUTH-003 — Reenvío del desafío de verificación.**
  Mientras `email_status = NO_VERIFICADO`, el usuario puede solicitar el reenvío del desafío respetando un intervalo mínimo de 120 segundos entre solicitudes. Cada reenvío genera un nuevo enlace y código, ambos con nueva vigencia de 60 minutos, e invalida de inmediato el enlace y código emitidos previamente.
- **RF-AUTH-004 — Desafío expirado o inválido.**
  Si el usuario intenta verificar su correo con un enlace o código expirado, ya invalidado por un reenvío posterior, o incorrecto, el sistema rechaza la operación e indica que debe solicitar un nuevo código (RF-AUTH-003).
- **RF-AUTH-005 — Registro con correo ya existente.**
  Si el correo proporcionado en RF-AUTH-001 ya pertenece a otra cuenta (ya sea de un afiliado o administrador), el sistema no crea una cuenta duplicada y distingue dos casos:
  a) **Verificación pendiente** (`email_status = NO_VERIFICADO`): el sistema informa que ya existe un registro pendiente de verificación para ese correo y ofrece reenviar el desafío (RF-AUTH-003), en lugar de crear una cuenta nueva.
  b) **Correo ya verificado** (`email_status = VERIFICADO`): el sistema responde con el mensaje _"Este correo ya está registrado"_.
- **RF-AUTH-006 — Acceso tras verificar el correo.**
  Una vez `email_status = VERIFICADO`, el usuario puede iniciar sesión. El nivel de acceso depende de su `membership_status` (matriz de RF-MEMB-002); inmediatamente después de la verificación ese estado es `NO_INICIADA`, por lo que el acceso se limita a completar y enviar el formulario **"Registro de Profesionales y Servicios de la Red de Egresados de Posgrado del TecNM (REP TecNM)"**.

### 3.2 Acceso y sesión

- **RF-AUTH-007 — Validación de acceso según estado de afiliación.** En cada inicio de sesión de una cuenta `AFILIADO`, el sistema valida su `membership_status` vigente y habilita únicamente las funcionalidades correspondientes a ese estado, conforme a la matriz de efectos de RF-MEMB-002. Esta validación no aplica a cuentas `ADMINISTRADOR`, cuyo acceso se rige por su subtipo (RF-AUTH-015).
- **RF-AUTH-008 — Guardado de progreso del formulario.** Mientras `membership_status` sea `NO_INICIADA` o `REQUIERE_CORRECCION`, el sistema permite guardar el avance del formulario de registro y continuar su captura en sesiones posteriores.
- **RF-AUTH-009 — Expiración de sesión.** La sesión de cualquier cuenta (`AFILIADO` o `ADMINISTRADOR`) expira automáticamente tras 30 días de inactividad y exige reautenticación. El cierre de sesión manual está disponible en cualquier momento.

### 3.3 Contraseña y datos de acceso

- **RF-AUTH-010 — Política de contraseña.** Toda contraseña, tanto en el registro como en cualquier cambio posterior, debe tener mínimo 8 caracteres e incluir al menos una mayúscula, un número y un símbolo.
- **RF-AUTH-011 — Recuperación de contraseña.** El sistema permite recuperar la contraseña mediante un enlace de un solo uso enviado al correo registrado, con vigencia de 60 minutos. Reglas aplicables:

  Cada cuenta puede solicitar la recuperación hasta 5 veces dentro de un período de 7 días, contado desde la primera solicitud de ese período; transcurridos los 7 días, el contador se reinicia.

  Si la cuenta está en `membership_status` `RECHAZADO` o `SUSPENDIDO` o si su correo no ha sido verificado `email_status = NO_VERIFICADO`, el sistema no genera ni envía el enlace. _(Una cuenta en_ `BAJA` _ya no existe como tal — RF-MEMB-008 —, por lo que ese caso queda cubierto de forma natural por "la cuenta no existe", sin necesidad de una regla aparte. Por otro lado, un correo no verificado no tiene una cuenta asociada así que no tiene sentido que recuperar contraseña funcione y el no mostrar un mensaje de que su correo está en proceso de verificación es deliberado)._

  Independientemente de si el correo existe, de si la cuenta existe o de su estado, el sistema siempre muestra: _"Si existe una cuenta asociada a este correo, se enviará un correo electrónico para recuperar la contraseña."_ Esta respuesta uniforme evita revelar la existencia o el estado de una cuenta **a través de este flujo en particular**; no es una garantía general anti-enumeración, ya que el flujo de registro (RF-AUTH-005) sí puede revelar si un correo está en uso.

- **RF-AUTH-012 — Cambio de correo de inicio de sesión.** Un afiliado puede cambiar su correo de inicio de sesión desde su perfil. El proceso es autogestionado: requiere introducir la contraseña actual y confirmar un código de seis dígitos enviado al nuevo correo. Una vez confirmado, el nuevo correo sustituye al anterior para el inicio de sesión, y la acción queda registrada en la bitácora de auditoría (RF-AUTH-016). Además, se notifica al correo _anterior_ que hubo un cambio.

### 3.4 Cuentas administrativas

- **RF-AUTH-013 — Creación de cuentas ADMINISTRADOR.** No existe registro público para el rol ADMINISTRADOR. Durante el despliegue inicial del sistema se crea mediante un procedimiento seguro (seed) una cuenta ADMINISTRADOR con subtipo **GENERAL** y atributo `is_root = true`, denominada administrador raíz. A partir de ese momento, cualquier administrador con subtipo **GENERAL** puede crear nuevas cuentas ADMINISTRADOR, asignándoles nombre, correo electrónico (registrado con `email_status = VERIFICADO` y único en todo el sistema), contraseña y subtipo (`GENERAL` o `CONTENIDO`). El atributo `is_root` no puede asignarse mediante funcionalidades de la aplicación.
- **RF-AUTH-014 — Eliminación de cuentas ADMINISTRADOR.** Un administrador con subtipo **CONTENIDO** puede ser eliminado por cualquier administrador con subtipo **GENERAL**. Un administrador con subtipo **GENERAL** solo puede ser eliminado por el administrador raíz (`is_root = true`). Un administrador no puede eliminar su propia cuenta. En caso de pérdida de acceso al administrador raíz, su recuperación se realizará exclusivamente mediante un procedimiento de administración del sistema fuera de la aplicación (por ejemplo, un script o comandos SQL de recuperación ejecutado por un operador con acceso a la infraestructura).
- **RF-AUTH-015 — Permisos por subtipo de administrador.** Toda cuenta `ADMINISTRADOR` tiene asignado un subtipo (`GENERAL` o `CONTENIDO`) que determina de forma exclusiva sus permisos, conforme a la matriz de la sección 2 (Roles del Sistema y Matriz de Permisos).

### 3.5 Auditoría

- **RF-AUTH-016 — Bitácora de auditoría.** El sistema registra en la tabla `audit_logs` toda acción crítica, con al menos: `user_id` de quien la ejecuta, tipo de acción, entidad afectada, dirección IP y marca de tiempo. Son acciones críticas, de forma enunciativa y no limitativa: aprobación, corrección o rechazo de una solicitud de afiliación (RF-MEMB-003); cualquier cambio de `membership_status` (módulo RF-MEMB); eliminación de una publicación del repositorio; cambio de correo de inicio de sesión (RF-AUTH-012); creación o eliminación de cuentas `ADMINISTRADOR` (RF-AUTH-013, RF-AUTH-014).

Cuando la cuenta que originó un registro de auditoría deja de existir por alguno de los mecanismos de eliminación de RF-MEMB (borrado automático desde `RECHAZADO`, borrado manual desde `SUSPENDIDO`, o paso a `BAJA`), el registro en `audit_logs` **no** se elimina ni se anonimiza: conserva el `user_id` original aunque ya no exista integridad referencial con una cuenta activa.

### 4. Formulario de Registro de Afiliados

- **RF-PERFIL-001** El registro de afiliados, titulado _Registro de Profesionales y Servicios de la Red de Egresados de Posgrado del TecNM (REP TecNM_), se captura por secciones: datos generales, formación académica, perfil profesional, servicios, experiencia y proyectos, intereses de colaboración, visibilidad en el catálogo (si quiere aparecer o no) y si el teléfono y correo de contacto son públicos o no.

**Nota importante** Puedes suponer que este registro de formulario ya está creado como un formulario disponible como un componente que puedes importar usando la ruta "@/components/affiliate/register-form"

## 5. Estado y Ciclo de Vida de la Afiliación (RF-MEMB)

### 5.1 Estados posibles

- **RF-MEMB-001 — Estados de afiliación.**
  El `membership_status` de una cuenta `AFILIADO` es uno de ocho valores mutuamente excluyentes: `NO_INICIADA`, `PENDIENTE_APROBACION`, `REQUIERE_CORRECCION`, `RECHAZADO`, `ACTIVO`, `INACTIVO`, `SUSPENDIDO`, `BAJA`.

### 5.2 Matriz de estados y efectos

- **RF-MEMB-002 — Efectos de cada estado sobre el acceso y las funcionalidades.**
  El acceso a la plataforma depende exclusivamente del `membership_status` vigente:

  | Estado                 | Inicio de sesión                              | Qué puede hacer                                                                                                   | Catálogo público | Mensajería | Encuestas | Incluido en estadísticas          | Credencial digital (QR)                                                      |
  | ---------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | --------- | --------------------------------- | ---------------------------------------------------------------------------- |
  | `NO_INICIADA`          | Sí                                            | Completar y enviar por primera vez el formulario de registro; puede guardar avance (RF-AUTH-008)                  | No               | No         | No        | No incluido                       | No aplica                                                                    |
  | `PENDIENTE_APROBACION` | Sí, solo lectura                              | Consultar el estado de su solicitud; no puede modificar la respuesta ya enviada                                   | No               | No         | No        | No incluido                       | No aplica                                                                    |
  | `REQUIERE_CORRECCION`  | Sí                                            | Modificar su última respuesta (con guardado de avance) y reenviarla                                               | No               | No         | No        | No incluido                       | No aplica                                                                    |
  | `RECHAZADO`            | Sí, solo lectura, hasta su borrado (5.11)     | Consultar el motivo del rechazo; no puede modificar ni reenviar                                                   | No               | No         | No        | No incluido                       | No aplica                                                                    |
  | `ACTIVO`               | Sí                                            | Acceso completo: perfil, catálogo, mensajería, encuestas, repositorio de publicaciones, formulario de seguimiento | Sí               | Sí         | Sí        | Incluido                          | Vigente; identidad y datos de emergencia según configuración (RF-CRED-008)   |
  | `INACTIVO`             | Sí, solo lectura                              | Consultar su información y actualizar el formulario de seguimiento para solicitar reactivación                    | No               | No         | No        | Incluido                          | "AFILIACIÓN NO VIGENTE" en identidad; emergencia visible si está configurada |
  | `SUSPENDIDO`           | No — muestra _"Tu cuenta ha sido suspendida"_ | —                                                                                                                 | No               | No         | No        | Excluido                          | "AFILIACIÓN NO VIGENTE" en identidad; emergencia visible si está configurada |
  | `BAJA`                 | No — ver RF-MEMB-008                          | —                                                                                                                 | No               | No         | No        | Excluido (la cuenta ya no existe) | Página "No encontrado"                                                       |

### 5.3 Flujo de aprobación inicial

- **RF-MEMB-003 — Flujo de aprobación inicial de la solicitud de afiliación.**
  a) Al enviar por primera vez el formulario junto con la documentación requerida (desde `NO_INICIADA`), el estado cambia automáticamente a `PENDIENTE_APROBACION`.
  b) Un Administrador General revisa las solicitudes en `PENDIENTE_APROBACION` y decide una de tres acciones:
  - **Aprobar** → `ACTIVO`.
  - **Solicitar corrección** → `REQUIERE_CORRECCION`, indicando obligatoriamente observaciones capturado como un único texto largo de mínimo 25 caracteres y máximo 1500 caracteres.
  - **Rechazar** → `RECHAZADO`, indicando obligatoriamente un motivo textual de mínimo 25 y máximo 500 caracteres; esta transición programa el borrado automático de la cuenta en 7 días (5.11). c) Cuando el afiliado reenvía el formulario desde `REQUIERE_CORRECCION`, el estado vuelve automáticamente a `PENDIENTE_APROBACION` y la solicitud queda de nuevo disponible para revisión.

### 5.4 Transiciones posteriores a la activación

- **RF-MEMB-004 — Transiciones manuales (accionadas por un Administrador General).**

  | Transición                      | Condición / procedimiento                                                                                                                                                                                                                            |
  | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `ACTIVO` → `SUSPENDIDO`         | El administrador indica un motivo, incluido en la notificación al afiliado (RF-MEMB-010)                                                                                                                                                             |
  | `SUSPENDIDO` → `ACTIVO`         | Requiere confirmación explícita y un motivo, que se notifica al afiliado. Antes de confirmar, el sistema verifica si el formulario de seguimiento está desactualizado; si lo está, advierte que el destino real será `INACTIVO` en lugar de `ACTIVO` |
  | `SUSPENDIDO` → cuenta eliminada | El administrador puede eliminar permanentemente la cuenta y todos sus datos asociados; solo posible desde `SUSPENDIDO` (5.6)                                                                                                                         |

  Solo un Administrador General puede accionar estas transiciones y las de RF-MEMB-003(b).

- **RF-MEMB-005 — Transiciones automáticas entre ACTIVO e INACTIVO.**

  | Transición            | Disparador                                                                                                                 |
  | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
  | `ACTIVO` → `INACTIVO` | El afiliado no completa el formulario de seguimiento dentro de los 30 días posteriores al quedar `ACTIVO` por primera vez. |
  | `ACTIVO` → `INACTIVO` | Transcurren 12 meses sin que el afiliado actualice el formulario de seguimiento                                            |
  | `INACTIVO` → `ACTIVO` | El afiliado actualiza el formulario de seguimiento                                                                         |

  Estas transiciones automáticas no se aplican si la cuenta está en `SUSPENDIDO` o `BAJA`. Cabe resaltar que la regla de "30 días tras quedar ACTIVO" aplica solo la primera vez y es fija, por lo que si durante dicho periodo una cuenta vuelve a ACTIVO (tras una reactivación desde SUSPENDIDO) y si en esa reactivación el sistema ya validó que el seguimiento no está desactualizado (RF-MEMB-004), dicho plazo de 30 días no se reinicia.

### 5.5 Baja voluntaria del afiliado

- **RF-MEMB-006 — Solicitud de baja por el propio afiliado.**
  Un afiliado en `ACTIVO` o `INACTIVO` puede solicitar su propia baja desde su perfil. La acción:
  - No requiere aprobación de un administrador; el cambio a `BAJA` es inmediato.
  - Requiere confirmación explícita, en la que el sistema advierte que al continuar: se eliminarán sus publicaciones del repositorio, se eliminará su registro del catálogo, sus datos de emergencia dejarán de estar disponibles, sus datos se anonimizarán conforme a RF-MEMB-008, y la acción es irreversible.

### 5.6 Suspensión y reactivación

- **RF-MEMB-007 — Efectos de la suspensión.**
  Mientras una cuenta está en `SUSPENDIDO`:
  - El inicio de sesión queda bloqueado; al intentarlo se muestra _"Tu cuenta ha sido suspendida"_.
  - El perfil deja de mostrarse en el catálogo público y se excluye de las estadísticas del dashboard.
  - Los datos del afiliado se conservan íntegros en la base de datos.
  - Un Administrador General puede eliminar de forma permanente la cuenta y todos sus datos (borrado completo, **no** anonimización); solo puede ejecutarse desde `SUSPENDIDO`, y es irreversible.
  - La reactivación sigue el procedimiento de RF-MEMB-004.

### 5.7 Baja definitiva y anonimización de datos

- **RF-MEMB-008 — Efectos de la baja (BAJA).**
  Al pasar una cuenta a `BAJA` (RF-MEMB-006):
  - **Anonimización del perfil**: el nombre se sustituye por un valor genérico ("John Doe"); se eliminan por completo de la base de datos: estado civil, correo y teléfono de contacto, LinkedIn/ORCID/sitio web profesional, ocupación actual, centro de trabajo, descripción de servicios ofrecidos, proyectos relevantes y fotografía.
  - **Eliminación de credenciales**: la cuenta de acceso (correo/contraseña) se elimina de inmediato; el correo queda disponible de inmediato para un nuevo registro. Por ende, un intento posterior de login con ese correo se comporta como si no existiera una cuenta.

### 5.8 Efecto en la credencial digital (QR)

- **RF-MEMB-009 — Estado de afiliación y credencial digital.**
  Al escanear el código QR de la credencial:
  - En `SUSPENDIDO` o `INACTIVO`, la sección de identidad muestra "AFILIACIÓN NO VIGENTE"; la sección de datos de emergencia permanece visible si el afiliado la configuró así (RF-CRED-008).
  - En `BAJA`, se muestra una página de "No encontrado".

### 5.9 Notificaciones por cambio de estado

- **RF-MEMB-010 — Notificación de cambios de estado.**
  El sistema notifica por correo electrónico al afiliado ante todo cambio de su `membership_status`. Cuando la transición tiene un motivo u observaciones asociadas (rechazo, solicitud de corrección, suspensión, reactivación desde suspensión), la notificación los incluye.

### 5.10 Carácter indefinido de la afiliación

- **RF-MEMB-011 — Vigencia de la afiliación.**
  Una vez alcanzado `ACTIVO`, la afiliación es indefinida: no existe fecha de vencimiento ni proceso de renovación periódica.

### 5.11 Eliminación y depuración de cuentas

- **RF-MEMB-012 — Política de depuración de solicitudes inconclusas.** El sistema aplica políticas de eliminación automática según el estado y la antigüedad:
  - **Correo no verificado:** Si el correo no ha sido verificado 7 días después del registro, la cuenta se elimina automáticamente y el correo queda disponible para un nuevo registro.
  - **Formulario inconcluso:** Las cuentas con `email_status = VERIFICADO` que permanecen en `NO_INICIADA` o `REQUIERE_CORRECCION` sin reenviar el formulario se eliminan automáticamente a los 30 días de haber entrado a ese estado. A los 15 días, el sistema envía un correo automático advirtiendo la eliminación próxima.

  Las cuentas en `INACTIVO` y `PENDIENTE_APROBACION` no están sujetas a eliminación automática y pueden permanecer en ese estado indefinidamente.

**Resumen de todas las eliminaciones de cuenta contempladas en el sistema:**

| Estado de origen                        | Tipo de eliminación | Plazo                             | Aviso previo                                      | Ejecutor              | Efecto sobre los datos                  |
| --------------------------------------- | ------------------- | --------------------------------- | ------------------------------------------------- | --------------------- | --------------------------------------- |
| Correo no verificado                    | Automática          | 7 días desde el registro          | No aplica                                         | Sistema               | Borrado completo                        |
| `NO_INICIADA` / `REQUIERE_CORRECCION`   | Automática          | 30 días desde que entró al estado | Correo a los 15 días                              | Sistema               | Borrado completo                        |
| `RECHAZADO`                             | Automática          | 7 días desde el rechazo           | Notificación al rechazar (RF-MEMB-010)            | Sistema               | Borrado completo                        |
| `SUSPENDIDO`                            | Manual              | Sin plazo                         | No aplica                                         | Administrador General | Borrado completo                        |
| `ACTIVO` / `INACTIVO` (baja voluntaria) | Manual, inmediata   | Inmediato                         | Confirmación explícita del afiliado (RF-MEMB-006) | El propio afiliado    | Anonimización + borrado de credenciales |

## 6. Credencial Digital (RF-CRED)

- **RF-CRED-001** El sistema genera la credencial de forma automática en el momento en que la cuenta pasa a estado `ACTIVO`.
- **RF-CRED-002** El número de afiliado se asigna automáticamente al pasar al estado ACTIVO por primera vez, con el formato `REP-{año de afiliación}-{correlativo}`. El correlativo se genera de forma ascendente con 5 dígitos (00001, 00002, etc.). Si el sistema alcanza el límite de 99,999 afiliados en un mismo año, escalará automáticamente a un formato de 6 dígitos (000001) para evitar el bloqueo de nuevas aprobaciones. Este número es inmutable una vez asignado y no puede reutilizarse.
- **RF-CRED-003** El sistema genera un folio alfanumérico único de 12 caracteres (hash) en el momento de la aprobación, usado para verificación.
- **RF-CRED-004** La plataforma ofrece tres formatos de credencial: imprimible (PDF), digital (vista en pantalla) y pública de verificación (vía QR).
- **RF-CRED-005** La credencial imprimible incluye, en el frente: fotografía, nombre completo, número de afiliado, instituto del TecNM de procedencia, año de aprobación, logotipos institucionales, código QR y folio; en el reverso: una franja de "EN CASO DE EMERGENCIA" con tipo sanguíneo, alergias o condiciones médicas, y contacto de emergencia (nombre, parentesco, teléfono).

Esta credencial imprimible puede descargarse en formato PDF, tanto en tamaño carnet como en tamaño carta. Además, solo puede ser vista/impresa por un administrador general y el afiliado en cuestión.

- **RF-CRED-006** La vista digital dentro de la plataforma muestra únicamente los datos profesionales, el QR y el folio. Los datos de emergencia no se muestran por defecto por defecto. Para habilitarla, hay un botón de "Ver información de emergencia" dentro de esta vista digital donde se exige volver a introducir su contraseña para poder mostrar dichos datos.
- **RF-CRED-007** El perfil del afiliado incluye una sección para capturar/editar datos de emergencia: tipo sanguíneo, alergias o condiciones médicas relevantes, y contacto de emergencia (nombre, parentesco, teléfono). Editarlos requiere volver a introducir su contraseña.
- **RF-CRED-008** El afiliado dispone de un control de privacidad para activar o desactivar la visibilidad pública de sus datos de emergencia cuando se escanea su código QR.
- **RF-CRED-009** El código QR apunta siempre a la URL pública `reptecnm.org.mx/verificar/{folio}`, accesible sin autenticación. Esta vista pública de verificación se divide en dos secciones: identidad (fotografía, nombre, número de afiliado, estado de afiliación, folio) y emergencia, que es visible según el control de privacidad del afiliado.
- **RF-CRED-010** La plataforma permite la búsqueda manual del folio de verificación, sin necesidad de escanear el QR, devolviendo la misma información.

## Lo que quiero (IMPORTANTE)

Necesito que ignores ciertos detalles que no se detallan (como catalogo, repositorio de documentos, avisos, encuentas, etc). Lo que necesito es un modelo relacional para solo lo mencionado anteriormente explicitamente. Detalles del afiliado puedes ignorarlos y puedes asumir cosas básicas como

- Apellido paterno
- Apellido materno
- Nombre
- Path hacia fotografia
- Path hacia comprobante de pago
- Telefono móvil
- Telefono de casa
- Correo electrónico de contacto
- Otros datos

Lo importante es reflejar bien sus estados de afiliación y modelar bien todo eso mencionado.
Lo que me interesa es entonces el modelo relacional listo para poder modelar todo eso. Hazlo en drizzle suponiendo que estoy usando postgres (neon).
El formulario de registro y sus campos ya estoy trabajando en ello, pero mientras asume algo básico para que funcione y no lo acoples para que después yo lo intregue cuando esté listo
