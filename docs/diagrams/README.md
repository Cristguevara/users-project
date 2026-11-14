# Diagramas de la solución — user-proyect

Diagramas PlantUML de las clases que nacen de aplicar patrones de diseño a la
aplicación **Usuarios Empresa App**, siguiendo el estilo de arquitectura por
capas de `PIC_Portal_transaction_MF` y el vocabulario de relaciones del
diagrama de referencia del curso (`class_uml/uml_class_diagram.puml`):
asociación, dependencia, agregación, composición, herencia y realización.

## Archivos

**Diagramas de conjunto:**

| Archivo | Qué muestra |
|---|---|
| `patterns-class-diagram.puml` | Diagrama de **clases** por capas (base / domain / patterns / data / presentation) y cómo cooperan los patrones. |
| `change-status-sequence.puml` | Diagrama de **secuencia** del flujo "Inactivar/Activar" + re-consulta del listado. |

**Un diagrama por patrón** (estilo de los notebooks del curso: abstracción,
implementaciones y relaciones):

| Archivo | Patrón | Clases clave |
|---|---|---|
| `bridge.puml` | Bridge | `UserRepository` (abstracción) ↔ `UserHttpRepository` (implementación) |
| `command.puml` | Command | `UseCase<S,T>` + los casos de uso concretos |
| `factory-method.puml` | Factory Method | `DataProviders` (useFactory) crea los casos de uso |
| `adapter.puml` | Adapter | `Mapper<I,O>` ← `UserResponseMapper` (Entity → User) |
| `builder.puml` | Builder | `UserRequestBuilder` → `UserRequestBody` |

Render: extensión *PlantUML* de VS Code, o `plantuml archivo.puml`.

> El **diagnóstico del código "antes"** (versión sin patrones) y su mapeo
> problema → patrón, con ubicaciones archivo:línea, está en
> [`../../legacy/DIAGNOSTICO.md`](../../legacy/DIAGNOSTICO.md). El código previo
> monolítico vive en `legacy/` y no se compila con la app.

---

## Arquitectura (front puro, sin base de datos)

La app es **netamente front-end**. No hay base de datos: `data/mocks/*-backend.mock.ts`
**simula un servidor remoto** que responde un `SuccessResponse<Entity>` tras un
`delay`, exactamente como respondería una API HTTP. La implementación concreta
del repositorio consume ese mock igual que consumiría `HttpClient`; el día que
exista un backend real, solo cambian esas llamadas por `http.get/post(...)`.

> Los 5 patrones aplicados son GoF (Bridge, Command, Factory Method, Adapter,
> Builder). "Command" se materializa como los casos de uso y "Bridge" separa la
> operación de negocio del origen de datos.

Regla de dependencias (de adentro hacia afuera):

```
presentation → domain (UseCases → UserRepository abstracto)
data implementa UserRepository, llama al backend simulado y mapea Entity → Model
base y domain NO dependen de Angular HTTP ni de data
```

---

## Los 5 patrones (y por qué cada uno es extensible)

### 1. Bridge (Puente)
`UserRepository`/`DependencyRepository` son la **abstracción** (qué operaciones
existen) y `UserHttpRepository`/`DependencyHttpRepository` son la
**implementación** (de dónde salen los datos). Son dos jerarquías separadas que
varían de forma independiente: las operaciones por un lado, el origen de datos
(mock hoy, HTTP real mañana) por otro. El enlace vive solo en
`data/data.providers.ts` (`useClass`), así que cambiar o añadir un origen de
datos no toca la abstracción ni sus consumidores, y no genera "explosión de
clases" (no hay `UserHttp`, `UserMongo`, `UserSql`... por cada combinación). Es
el caso de "persistencia poliglota" que describe el material del curso.

### 2. Command (UseCase)
Cada operación (listar, buscar, obtener por id, crear, editar, cambiar estado)
es un objeto con la interfaz uniforme `UseCase<S,T>.execute()`. Agregar una
acción nueva es crear una clase nueva sin tocar las existentes (OCP). La vista
inyecta casos de uso, no repositorios.

### 3. Factory Method (vía DI)
En `data.providers.ts`, cada caso de uso se construye con una `useFactory` que le
inyecta su repositorio abstracto. Centraliza el ensamblaje y mantiene la
Inversión de Dependencias. Es el mismo patrón que usa `PIC_Portal_transaction_MF`.

### 4. Adapter (Mapper)
`UserResponseMapper extends Mapper<I,O>` traduce la `UserEntity` que devuelve el
"servidor" al `User` que la UI consume (arma `fullName`, resuelve la dependencia
por su id). Concentra la traducción y evita que el shape del backend se filtre a
las vistas. Añadir un campo derivado se hace aquí, sin tocar la entidad ni la UI.

### 5. Builder
`UserRequestBuilder` construye el `UserRequestBody` paso a paso según la
operación (crear con estado Activo, editar sin estado, cambiar solo estado,
filtrar por búsqueda/dependencia). Un filtro nuevo = un método nuevo encadenable,
sin tocar los existentes (OCP). Encapsula además la regla "usuario nuevo nace
Activo" en `asNewUser()`.

### Extra: Dispatch table (variante funcional de Strategy, extensible)
`COLUMN_RENDERERS` (en `presentation/pages/user-list/user-column.renderers.ts`)
mapea cada id de columna a la función que formatea su celda. Agregar una columna
es agregar una entrada, sin `switch` ni tocar la plantilla. Es la misma idea que
el `RENDERERS` del pipe `detail-field` de PIC.

---

## Por qué se descartaron Singleton, Observer y Strategy (de estado)

- **Singleton**: representaba una "base de datos" en el front. Se eliminó porque
  la app es front puro; el estado ahora vive en el servidor simulado.
- **Observer**: RxJS/Angular ya proveen el mecanismo de notificación de forma
  nativa; implementarlo a mano era redundante. La re-consulta tras cambiar estado
  se hace explícitamente en el `subscribe` del caso de uso.
- **Strategy (para el estado)**: con solo dos estados (Activo/Inactivo) no aporta
  extensibilidad real; era sobreingeniería. La decisión Activar/Inactivar es un
  ternario simple en la vista. La necesidad de extensibilidad se cubre mejor con
  Builder, Command y la dispatch table.

---

## Colaboración en runtime

`change-status-sequence.puml` muestra el flujo al pulsar "Inactivar":
1. La vista dispara `ChangeUserStatusUseCase.execute(...)` (**Command**).
2. El caso de uso llama a la **abstracción** `UserRepository` (**Bridge**);
   Angular enchufa la **implementación** concreta por **Factory/useClass**.
3. La implementación arma el request con **Builder**, llama al **backend
   simulado** y traduce la respuesta con el **Adapter**.
4. Al terminar, la vista vuelve a ejecutar `ListUsersUseCase` para re-consultar
   el listado (requisito de "consultar de nuevo tras el cambio").
