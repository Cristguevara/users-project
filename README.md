# Usuarios Empresa App (user-proyect)

Aplicación **Angular 19 + PrimeNG 19**, netamente front-end, que gestiona
usuarios de una empresa (listar, buscar, crear, editar y activar/inactivar).
Está construida con arquitectura por capas al estilo de
`PIC_Portal_transaction_MF` y aplica **5 patrones de diseño GoF** documentados
dentro del propio código.

**No hay base de datos.** La carpeta `data/mocks/*-backend.mock.ts` **simula un
servidor remoto**: responde un `SuccessResponse<Entity>` tras un `delay`, tal
como respondería una API HTTP real. El repositorio concreto consume ese mock
igual que consumiría `HttpClient`.

## Cómo ejecutar

```bash
npm install
npm start        # ng serve -> http://localhost:4200
npm run build    # compilación de producción
```

## Estructura (Clean Architecture)

```
src/app/
├── base/                    # primitivas transversales (sin framework)
│   ├── use-case.ts          # UseCase<S,T> (Command)
│   ├── mapper.ts            # Mapper<I,O> (Adapter, base)
│   ├── mapper-to.ts         # MapperTo<I,O> (Adapter unidireccional)
│   └── response.ts          # SuccessResponse<T> (envelope del backend)
├── domain/                  # núcleo estable, sin dependencias de infraestructura
│   ├── models/              # User, UserEntity, Dependency, UserFilter, UserStatus
│   ├── repositories/        # UserRepository, DependencyRepository (abstractos)
│   └── usecases/            # un caso de uso por operación (Command)
├── data/                    # implementaciones concretas + backend simulado
│   ├── entities/            # UserRequestBody (shape que espera el backend)
│   ├── mappers/             # UserResponseMapper (Entity -> User)
│   ├── mocks/               # servidor simulado + datos semilla
│   ├── repositories/        # UserHttpRepository, DependencyHttpRepository
│   └── data.providers.ts    # Factory Method (useFactory) + useClass
├── patterns/
│   └── builder/             # UserRequestBuilder (Builder)
└── presentation/pages/      # UserListComponent, UserFormComponent
                             #   user-column.renderers.ts (dispatch table)
docs/diagrams/               # diagramas PlantUML + explicación
```

## Diagnóstico del código "antes" (qué estaba mal)

Cada archivo de patrón incluye, comentado, el "antes" concreto que lo motivó.
Resumen:

1. **Operación de negocio y origen de datos fundidos** — la clase que consultaba
   usuarios conocía también `HttpClient` y la URL; soportar otro origen obligaría
   a duplicar clases por cada combinación (explosión de clases; no testeable). → **Bridge**.
2. **Lógica de negocio dentro de los componentes** — cada acción vivía mezclada
   con la UI, sin una unidad reutilizable. → **Command (UseCase)**.
3. **Ensamblaje con `new` en los componentes** — cada componente construía el
   repositorio y los casos de uso conociendo las clases concretas. → **Factory Method (DI)**.
4. **Conversión de datos duplicada en cada vista** — `fullName` y la resolución
   de la dependencia por id se repetían por plantilla (viola DRY; el shape del
   backend se filtraba a la UI). → **Adapter (Mapper)**.
5. **Construcción del request repetida y regla de estado suelta** — cada
   operación armaba el body a mano y repetía `status: 'Activo'`, fácil de
   desincronizar/olvidar. → **Builder**.

## Los patrones aplicados (después)

| Patrón | Clase / archivo | Rol | Extensibilidad |
|---|---|---|---|
| Bridge | `UserRepository` (abstracción) ↔ `UserHttpRepository` (implementación) | separa la operación de negocio del origen de datos | añadir/cambiar origen (mock ↔ HTTP real) = 1 `useClass`, sin explosión de clases |
| Command (UseCase) | `domain/usecases/*` | encapsula cada acción de negocio | acción nueva = clase nueva (OCP) |
| Factory Method | `data/data.providers.ts` | ensambla los casos de uso vía DI | provider nuevo sin tocar vistas |
| Adapter (Mapper) | `UserResponseMapper` | `UserEntity` (backend) → `User` (UI) | campo derivado nuevo en un solo lugar |
| Builder | `UserRequestBuilder` | arma el request según la operación | filtro nuevo = método encadenable nuevo |

Extra (variante funcional de Strategy): `COLUMN_RENDERERS` en la lista es una
**tabla de despacho** para el texto de cada columna; agregar una columna es
agregar una entrada, sin `switch`.

## Patrones descartados (y por qué)

- **Singleton**: representaba una "base de datos" en el front; se eliminó porque
  la app es front puro y el estado vive en el servidor simulado.
- **Observer**: RxJS/Angular ya lo proveen de forma nativa; implementarlo a mano
  era redundante. La re-consulta tras cambiar estado es un `subscribe` explícito.
- **Strategy (para el estado)**: con solo dos estados no aporta extensibilidad
  real; era sobreingeniería. Se reemplazó por un ternario simple en la vista.

Los detalles ("qué es", "cómo se usa", "por qué este y no otro" y el código
"antes") están comentados dentro de cada archivo. Diagramas en `docs/diagrams/`.
