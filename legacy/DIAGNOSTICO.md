# Diagnóstico del código "antes" y mapeo a patrones

Este documento sustenta la **dimensión 1** de la rúbrica (diagnóstico del código
"antes"). La carpeta `legacy/` contiene la versión ORIGINAL del proyecto, sin
patrones, con todos los problemas concentrados en dos componentes monolíticos:

- `legacy/user-list.component.ts` — lista de usuarios.
- `legacy/user-form.component.ts` — formulario de crear/editar.

Cada problema está marcado en el código con un comentario `PROBLEMA X` y se cita
a continuación con su ubicación exacta (archivo:línea), junto al patrón que lo
resuelve en la versión refactorizada (`src/app/...`).

---

## Resumen problema → patrón

| # | Problema | Ubicación en el "antes" | Patrón (después) | Ubicación en el "después" |
|---|---|---|---|---|
| A | Operación de negocio y origen de datos fundidos (HttpClient + URL en la vista) | `legacy/user-list.component.ts:83-90`, `:95-97`, `:126`; `legacy/user-form.component.ts:53-56`, `:61-63` | **Bridge** | `src/app/domain/repositories/user.repository.ts` ↔ `src/app/data/repositories/user-http.repository.ts` |
| B | Lógica de negocio embebida en el componente, no reutilizable ni testeable | `legacy/user-list.component.ts:99-103`; `legacy/user-form.component.ts:67-71` | **Command (UseCase)** | `src/app/domain/usecases/*.usecase.ts` |
| C | Conversión de datos duplicada en la vista (nombre completo + resolver dependencia) | `legacy/user-list.component.ts:59-65`, `:111-117` | **Adapter (Mapper)** | `src/app/data/mappers/user-response.mapper.ts` |
| D | `if/else` de estado duplicado (plantilla + servicio) | `legacy/user-list.component.ts:68-71`, `:118-123` | ternario simple + tabla de despacho de columnas | `src/app/presentation/pages/user-list/user-list.component.ts`, `.../user-column.renderers.ts` |
| E | Request body armado a mano en cada operación | `legacy/user-list.component.ts:103-105`, `:123-125`; `legacy/user-form.component.ts:82-93`, `:95-107` | **Builder** | `src/app/patterns/builder/user-request.builder.ts` |
| F | Regla de negocio "usuario nuevo nace Activo" suelta en la UI | `legacy/user-form.component.ts:95-107` | **Builder** (`asNewUser()`) + **Factory Method** (ensamblaje) | `src/app/patterns/builder/user-request.builder.ts`, `src/app/data/data.providers.ts` |

---

## Detalle de cada problema

### A. Abstracción e implementación fundidas → Bridge
En el "antes", el componente inyecta `HttpClient` y escribe la URL directamente
(`legacy/user-list.component.ts:83-90` y `:95-97`; también en el toggle,
`:126`). La *operación* (listar/cambiar estado) y el *origen de datos* (HTTP)
viven en la misma clase. Consecuencia: para soportar otro origen habría que
duplicar el componente por cada combinación (explosión de clases) y no es
testeable sin HTTP real. Viola DIP (depende de una clase concreta) y OCP.

**Solución (Bridge):** `UserRepository` es la abstracción (qué operaciones
existen) y `UserHttpRepository` la implementación (de dónde salen los datos).
Dos jerarquías que varían por separado; el enlace vive en `data.providers.ts`.

### B. Lógica de negocio embebida en la vista → Command
"Listar usuarios" y "cargar un usuario" son lógica de negocio escrita dentro de
los componentes (`legacy/user-list.component.ts:99-103`;
`legacy/user-form.component.ts:67-71`). No se puede reutilizar ni probar sin
instanciar el componente.

**Solución (Command):** cada operación es un caso de uso con `execute()`
uniforme (`ListUsersUseCase`, `GetUserByIdUseCase`, etc.).

### C. Conversión duplicada en la vista → Adapter
El nombre completo se arma en la plantilla (`legacy/user-list.component.ts:61`)
y la dependencia se resuelve con un método propio de la vista
(`resolveDependencyName`, `:111-117`). Esa lógica se repetiría en cualquier
otra vista que muestre usuarios (viola DRY) y filtra el shape del backend
(`dependencyId`) a la UI.

**Solución (Adapter):** `UserResponseMapper` traduce `UserEntity` → `User`
(arma `fullName`, resuelve la dependencia) en un único lugar reutilizable.

### D. `if/else` de estado duplicado
La decisión Activo↔Inactivo aparece en la plantilla para el texto del botón
(`legacy/user-list.component.ts:70-71`) y de nuevo en `toggleStatus` para
calcular el nuevo estado (`:122-123`). Dos sitios que hay que mantener
sincronizados.

**Solución:** con solo dos estados, un ternario simple centralizado en el
componente refactorizado; y para el formateo de columnas, una **tabla de
despacho** (`user-column.renderers.ts`) extensible sin `switch`.

### E. Request body armado a mano → Builder
Cada operación construye su objeto de petición inline: el query de búsqueda
(`legacy/user-list.component.ts:103-105`), el body del cambio de estado
(`:123-125`), el body de edición (`legacy/user-form.component.ts:85-93`) y el de
creación (`:98-107`). La forma se repite y es fácil equivocarse (p.ej. enviar
`status` al editar y pisar el estado).

**Solución (Builder):** `UserRequestBuilder` arma el body paso a paso según la
operación, con métodos encadenables (`withPersonalData`, `withStatus`,
`withSearch`, `asNewUser`).

### F. Regla de negocio suelta en la UI → Builder + Factory Method
El `status: 'Activo'` del usuario nuevo está escrito a mano dentro del
componente (`legacy/user-form.component.ts:104`). Si otra pantalla creara
usuarios, habría que recordar repetir la regla.

**Solución:** la regla queda encapsulada en `UserRequestBuilder.asNewUser()`, y
el ensamblaje de los casos de uso se centraliza con **Factory Method**
(`useFactory` en `data.providers.ts`).

---

## Nota sobre la carpeta legacy/

El código de `legacy/` **no se compila con la aplicación** (no está referenciado
por `app.routes.ts` ni por `app.config.ts`). Se conserva únicamente como
evidencia del punto de partida, para poder citar archivo:línea durante la
sustentación y contrastar "antes" vs "después".
