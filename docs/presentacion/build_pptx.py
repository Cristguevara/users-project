#!/usr/bin/env python3
"""
Genera la presentación (PowerPoint) de user-proyect.

Estructura:
  1. Portada: nombre de la app
  2. Problema que resuelve la aplicación
  3..N. Por cada patrón (5): dos diapositivas
        a) diagrama (cajas) + por qué se usó
        b) cómo: código "Antes" (izq) vs "Después" (der)

Estilo: paleta moderna oscura con acentos, tipografía limpia.
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# ---------------------------------------------------------------- paleta
BG        = RGBColor(0x0F, 0x17, 0x2A)   # azul noche
BG_SOFT   = RGBColor(0x1B, 0x26, 0x3B)   # panel
ACCENT    = RGBColor(0x38, 0xBD, 0xF8)   # cian
ACCENT2   = RGBColor(0xA7, 0x8B, 0xFA)   # violeta
GREEN     = RGBColor(0x34, 0xD3, 0x99)   # después
RED       = RGBColor(0xF8, 0x71, 0x71)   # antes
WHITE     = RGBColor(0xF8, 0xFA, 0xFC)
MUTE      = RGBColor(0x94, 0xA3, 0xB8)
CODE_BG   = RGBColor(0x0B, 0x11, 0x20)
CARD_ANTES= RGBColor(0x2A, 0x16, 0x1B)
CARD_DESP = RGBColor(0x10, 0x24, 0x22)

FONT      = "Segoe UI"
MONO      = "Consolas"

SW, SH = Inches(13.333), Inches(7.5)   # 16:9


def solid(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()


def no_autofit(tf):
    # evita que PowerPoint reescale el texto
    tf.word_wrap = True


def add_bg(slide, color=BG):
    r = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, SH)
    solid(r, color)
    r.shadow.inherit = False
    slide.shapes._spTree.remove(r._element)
    slide.shapes._spTree.insert(2, r._element)
    return r


def add_rect(slide, x, y, w, h, color, radius=True):
    shp = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE, x, y, w, h)
    solid(shp, color)
    shp.shadow.inherit = False
    return shp


def add_text(slide, x, y, w, h, text, size, color=WHITE, bold=False,
             align=PP_ALIGN.LEFT, font=FONT, anchor=MSO_ANCHOR.TOP, italic=False):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    no_autofit(tf)
    tf.vertical_anchor = anchor
    tf.margin_left = Pt(4); tf.margin_right = Pt(4)
    tf.margin_top = Pt(2); tf.margin_bottom = Pt(2)
    lines = text.split("\n")
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        r = p.add_run(); r.text = ln
        r.font.size = Pt(size); r.font.bold = bold; r.font.italic = italic
        r.font.name = font; r.font.color.rgb = color
    return tb


def add_code(slide, x, y, w, h, title, code, title_color):
    """Panel de código con encabezado."""
    panel = add_rect(slide, x, y, w, h, CODE_BG)
    # barra de título
    bar = add_rect(slide, x, y, w, Inches(0.42), BG_SOFT)
    add_text(slide, x + Inches(0.12), y, w - Inches(0.2), Inches(0.42),
             title, 13, title_color, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    tb = slide.shapes.add_textbox(x + Inches(0.12), y + Inches(0.5),
                                  w - Inches(0.24), h - Inches(0.6))
    tf = tb.text_frame
    no_autofit(tf)
    for i, ln in enumerate(code.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        r = p.add_run(); r.text = ln if ln else " "
        r.font.size = Pt(10.5); r.font.name = MONO; r.font.color.rgb = WHITE
    return panel


def kicker(slide, text, color=ACCENT):
    add_text(slide, Inches(0.7), Inches(0.5), Inches(9), Inches(0.4),
             text, 14, color, bold=True)


def accent_bar(slide, y=Inches(0.95), x=Inches(0.72), w=Inches(0.9)):
    bar = add_rect(slide, x, y, w, Inches(0.09), ACCENT, radius=False)
    return bar


# =================================================================== deck
prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]


def new_slide():
    s = prs.slides.add_slide(BLANK)
    add_bg(s)
    return s


# ---------------------------------------------------------- 1. PORTADA
s = new_slide()
# bloque de acento decorativo
add_rect(s, Inches(0), Inches(0), Inches(0.35), SH, ACCENT, radius=False)
add_rect(s, Inches(0.35), Inches(0), Inches(0.12), SH, ACCENT2, radius=False)
add_text(s, Inches(1.1), Inches(2.2), Inches(11), Inches(0.5),
         "APLICACIÓN ANGULAR 19 + PRIMENG", 18, ACCENT, bold=True)
add_text(s, Inches(1.05), Inches(2.75), Inches(11.5), Inches(1.6),
         "Usuarios Empresa App", 60, WHITE, bold=True)
add_text(s, Inches(1.1), Inches(4.35), Inches(11), Inches(0.6),
         "Gestión de usuarios con 5 patrones de diseño GoF", 22, MUTE)
add_text(s, Inches(1.1), Inches(6.4), Inches(11), Inches(0.5),
         "Bridge · Command · Factory Method · Adapter · Builder", 15, ACCENT2, bold=True)

# ---------------------------------------------------------- 2. PROBLEMA
s = new_slide()
kicker(s, "EL PROBLEMA QUE RESUELVE")
accent_bar(s)
add_text(s, Inches(0.7), Inches(1.15), Inches(12), Inches(0.9),
         "Administrar los usuarios de una empresa", 34, WHITE, bold=True)

problema = (
    "Las empresas necesitan un punto único para gestionar quién tiene acceso a "
    "sus aplicaciones: darlos de alta, mantener sus datos al día y habilitarlos "
    "o deshabilitarlos sin borrarlos."
)
add_text(s, Inches(0.72), Inches(2.05), Inches(7.2), Inches(1.6),
         problema, 18, MUTE)

# tarjetas de features
feats = [
    ("Listar y buscar", "Ver todos los usuarios y filtrarlos por nombre o correo."),
    ("Crear y editar", "Alta con formulario; edición cargando los datos por su id."),
    ("Activar / Inactivar", "Habilitar o deshabilitar sin perder el registro."),
    ("Sin base de datos", "Front puro: los datos se piden a un backend simulado."),
]
fx, fy = Inches(0.72), Inches(3.7)
cw, ch, gap = Inches(2.95), Inches(2.4), Inches(0.28)
for i, (t, d) in enumerate(feats):
    x = fx + i * (cw + gap)
    card = add_rect(s, x, fy, cw, ch, BG_SOFT)
    add_rect(s, x, fy, cw, Inches(0.12), ACCENT if i % 2 == 0 else ACCENT2, radius=False)
    add_text(s, x + Inches(0.22), fy + Inches(0.35), cw - Inches(0.4), Inches(0.6),
             t, 17, WHITE, bold=True)
    add_text(s, x + Inches(0.22), fy + Inches(1.0), cw - Inches(0.44), Inches(1.2),
             d, 13.5, MUTE)

# ---------------------------------------------------- helper diagrama
def diagram_box(slide, x, y, w, h, title, subtitle, color):
    box = add_rect(slide, x, y, w, h, BG_SOFT)
    add_rect(slide, x, y, w, Inches(0.1), color, radius=False)
    add_text(slide, x + Inches(0.14), y + Inches(0.16), w - Inches(0.28), Inches(0.5),
             title, 14.5, WHITE, bold=True, align=PP_ALIGN.CENTER)
    if subtitle:
        add_text(slide, x + Inches(0.1), y + Inches(0.72), w - Inches(0.2), h - Inches(0.8),
                 subtitle, 11, MUTE, align=PP_ALIGN.CENTER)
    return box


def arrow(slide, x, y, w, label=""):
    ar = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, x, y, w, Inches(0.32))
    solid(ar, ACCENT)
    ar.shadow.inherit = False
    if label:
        add_text(slide, x, y - Inches(0.4), w, Inches(0.35),
                 label, 10.5, ACCENT, bold=True, align=PP_ALIGN.CENTER)
    return ar


def pattern_why_slide(idx, total, name, tipo, por_que_titulo, bullets, diagram_fn):
    s = new_slide()
    kicker(s, f"PATRÓN {idx}/{total}  ·  {tipo.upper()}")
    accent_bar(s)
    add_text(s, Inches(0.7), Inches(1.12), Inches(9), Inches(0.8),
             name, 34, WHITE, bold=True)
    add_text(s, Inches(0.72), Inches(1.85), Inches(6), Inches(0.5),
             por_que_titulo, 16, ACCENT2, bold=True)
    # zona diagrama (derecha) y por qué (izquierda)
    # por qué (izquierda)
    by = Inches(2.45)
    for b in bullets:
        dot = add_rect(s, Inches(0.75), by + Inches(0.07), Inches(0.16), Inches(0.16), ACCENT)
        add_text(s, Inches(1.05), by, Inches(5.4), Inches(0.9),
                 b, 14, WHITE)
        by += Inches(1.02)
    # diagrama (derecha)
    diagram_fn(s)
    return s


# ---- diagramas por patrón (cajas) ----
DIAG_X = Inches(6.7)
DIAG_W = Inches(5.9)


def diag_bridge(s):
    add_text(s, DIAG_X, Inches(1.95), DIAG_W, Inches(0.4),
             "Abstracción  ↔  Implementación", 13, ACCENT, bold=True, align=PP_ALIGN.CENTER)
    diagram_box(s, DIAG_X + Inches(1.6), Inches(2.4), Inches(2.7), Inches(1.0),
                "UserRepository", "«abstracción»\nlist / create / changeStatus", ACCENT)
    # línea
    conn = add_rect(s, DIAG_X + Inches(2.9), Inches(3.4), Inches(0.05), Inches(0.7), MUTE, radius=False)
    diagram_box(s, DIAG_X + Inches(0.1), Inches(4.15), Inches(1.85), Inches(1.05),
                "UserHttpRepository", "«implementación»\norigen real / mock", GREEN)
    diagram_box(s, DIAG_X + Inches(2.05), Inches(4.15), Inches(1.75), Inches(1.05),
                "UserGraphql…", "hermana futura", ACCENT2)
    diagram_box(s, DIAG_X + Inches(3.9), Inches(4.15), Inches(1.85), Inches(1.05),
                "UserIndexedDb…", "hermana futura", ACCENT2)
    add_text(s, DIAG_X, Inches(5.4), DIAG_W, Inches(0.9),
             "El consumidor usa la abstracción; la implementación\nse enchufa por DI. Evita la explosión de clases.",
             11.5, MUTE, align=PP_ALIGN.CENTER, italic=True)


def diag_command(s):
    diagram_box(s, DIAG_X + Inches(1.5), Inches(2.15), Inches(2.9), Inches(0.9),
                "UseCase<S,T>", "«interfaz»  execute(params)", ACCENT)
    add_text(s, DIAG_X, Inches(3.15), DIAG_W, Inches(0.3),
             "▲ realizan la interfaz", 10.5, MUTE, align=PP_ALIGN.CENTER)
    names = ["ListUsersUseCase", "CreateUserUseCase", "UpdateUserUseCase",
             "ChangeUserStatusUseCase"]
    yy = Inches(3.5)
    for i, n in enumerate(names):
        col = i % 2
        row = i // 2
        x = DIAG_X + Inches(0.2) + col * Inches(3.0)
        y = yy + row * Inches(0.9)
        diagram_box(s, x, y, Inches(2.8), Inches(0.72), n, "", GREEN)
    add_text(s, DIAG_X, Inches(5.5), DIAG_W, Inches(0.8),
             "Cada operación de negocio es un objeto con execute().\nLa vista solo dispara el comando.",
             11.5, MUTE, align=PP_ALIGN.CENTER, italic=True)


def diag_factory(s):
    diagram_box(s, DIAG_X + Inches(1.4), Inches(2.2), Inches(3.1), Inches(1.0),
                "data.providers.ts", "«factory» useFactory + deps", ACCENT)
    add_text(s, DIAG_X + Inches(2.7), Inches(3.25), Inches(0.5), Inches(0.7),
             "│", 20, MUTE, align=PP_ALIGN.CENTER)
    diagram_box(s, DIAG_X + Inches(0.3), Inches(3.95), Inches(2.6), Inches(0.95),
                "new ListUsersUseCase(repo)", "producto creado", GREEN)
    diagram_box(s, DIAG_X + Inches(3.05), Inches(3.95), Inches(2.6), Inches(0.95),
                "UserRepository", "dependencia inyectada", ACCENT2)
    add_text(s, DIAG_X, Inches(5.15), DIAG_W, Inches(1.0),
             "La factory crea el caso de uso y le inyecta su\nrepositorio. El cliente pide el caso de uso, no hace new.",
             11.5, MUTE, align=PP_ALIGN.CENTER, italic=True)


def diag_adapter(s):
    diagram_box(s, DIAG_X + Inches(0.1), Inches(2.6), Inches(1.85), Inches(1.1),
                "UserEntity", "forma del backend\ndependencyId, status", RED)
    arrow(s, DIAG_X + Inches(2.05), Inches(3.05), Inches(1.7), "UserResponseMapper")
    diagram_box(s, DIAG_X + Inches(3.9), Inches(2.6), Inches(1.85), Inches(1.1),
                "User", "forma de la UI\nfullName, dependency", GREEN)
    diagram_box(s, DIAG_X + Inches(1.45), Inches(4.35), Inches(3.0), Inches(0.95),
                "Mapper<I,O>", "«base» mapFrom(i): o", ACCENT)
    add_text(s, DIAG_X, Inches(5.55), DIAG_W, Inches(0.8),
             "Traduce la respuesta del backend al modelo que la UI\nespera, en un único lugar reutilizable.",
             11.5, MUTE, align=PP_ALIGN.CENTER, italic=True)


def diag_builder(s):
    diagram_box(s, DIAG_X + Inches(1.4), Inches(2.15), Inches(3.1), Inches(1.4),
                "UserRequestBuilder",
                "withPersonalData()\nasNewUser() · withStatus()\nwithSearch() · build()", ACCENT)
    arrow(s, DIAG_X + Inches(2.55), Inches(3.75), Inches(0.8))
    diagram_box(s, DIAG_X + Inches(1.4), Inches(4.35), Inches(3.1), Inches(1.0),
                "UserRequestBody", "producto construido\npaso a paso", GREEN)
    add_text(s, DIAG_X, Inches(5.6), DIAG_W, Inches(0.8),
             "Arma el request según la operación. asNewUser()\nencapsula la regla «nace Activo».",
             11.5, MUTE, align=PP_ALIGN.CENTER, italic=True)


def pattern_code_slide(idx, total, name, antes, despues):
    s = new_slide()
    kicker(s, f"PATRÓN {idx}/{total}  ·  EL CÓMO")
    accent_bar(s)
    add_text(s, Inches(0.7), Inches(1.12), Inches(11), Inches(0.7),
             f"{name}: Antes vs. Después", 30, WHITE, bold=True)
    colw = Inches(6.05)
    add_code(s, Inches(0.6), Inches(2.05), colw, Inches(4.9),
             "❌  ANTES  (sin patrón)", antes, RED)
    add_code(s, Inches(6.85), Inches(2.05), colw, Inches(4.9),
             "✅  DESPUÉS  (con patrón)", despues, GREEN)
    return s


# ============================================== CONTENIDO DE LOS 5 PATRONES
TOTAL = 5

# --- 1. BRIDGE ---
pattern_why_slide(
    1, TOTAL, "Bridge", "Estructural",
    "¿Por qué se usó?",
    [
        "Separa QUÉ se hace (operaciones) de DÓNDE vienen los datos (origen).",
        "Cambiar mock → backend real es 1 línea (useClass), sin tocar la vista.",
        "Evita la explosión de clases al combinar operación × origen.",
    ],
    diag_bridge,
)
pattern_code_slide(
    1, TOTAL, "Bridge",
    antes=(
        "// La vista conoce HttpClient + URL:\n"
        "@Component({ ... })\n"
        "export class UserListComponent {\n"
        "  constructor(private http: HttpClient) {}\n\n"
        "  ngOnInit() {\n"
        "    this.http\n"
        "      .get<User[]>(\n"
        "        'https://api.empresa.com/users')\n"
        "      .subscribe(u => this.users = u);\n"
        "  }\n"
        "}\n"
        "// operación + origen fundidos\n"
        "// no testeable, viola DIP/OCP"
    ),
    despues=(
        "// Abstracción (domain):\n"
        "export abstract class UserRepository {\n"
        "  abstract list(f): Observable<User[]>;\n"
        "  abstract create(d): Observable<User>;\n"
        "}\n\n"
        "// Implementación (data):\n"
        "export class UserHttpRepository\n"
        "  extends UserRepository {\n"
        "  list(f) { /* backend/mock */ }\n"
        "}\n"
        "// enlace: { provide: UserRepository,\n"
        "//           useClass: UserHttpRepository }"
    ),
)

# --- 2. COMMAND ---
pattern_why_slide(
    2, TOTAL, "Command", "Comportamiento",
    "¿Por qué se usó?",
    [
        "Encapsula cada operación de negocio como un objeto con execute().",
        "Saca la lógica del componente: reutilizable y testeable por separado.",
        "Añadir una acción nueva es una clase nueva, sin tocar las demás (OCP).",
    ],
    diag_command,
)
pattern_code_slide(
    2, TOTAL, "Command",
    antes=(
        "// Lógica de negocio dentro de la vista:\n"
        "export class UserListComponent {\n"
        "  loadUsers() {\n"
        "    let url = 'https://api…/users';\n"
        "    if (this.searchTerm)\n"
        "      url += '?search=' + this.searchTerm;\n"
        "    this.http.get<User[]>(url)\n"
        "      .subscribe(d => this.users = d);\n"
        "  }\n"
        "}\n"
        "// no reutilizable ni testeable aislado"
    ),
    despues=(
        "// Un caso de uso por operación:\n"
        "export class ListUsersUseCase\n"
        "  implements UseCase<UserFilter, User[]> {\n"
        "  constructor(\n"
        "    private repo: UserRepository) {}\n\n"
        "  execute(filter: UserFilter) {\n"
        "    return this.repo.list(filter);\n"
        "  }\n"
        "}\n"
        "// la vista: listUsers.execute(filtro)"
    ),
)

# --- 3. FACTORY METHOD ---
pattern_why_slide(
    3, TOTAL, "Factory Method", "Creacional",
    "¿Por qué se usó?",
    [
        "Centraliza cómo se crean los casos de uso y qué repositorio reciben.",
        "El componente no hace new ni conoce las clases concretas (DIP).",
        "Un caso de uso nuevo = un provider nuevo, sin tocar las vistas.",
    ],
    diag_factory,
)
pattern_code_slide(
    3, TOTAL, "Factory Method",
    antes=(
        "// El componente ensambla todo a mano:\n"
        "export class UserListComponent {\n"
        "  private repo =\n"
        "    new UserHttpRepository();\n"
        "  private listUsers =\n"
        "    new ListUsersUseCase(this.repo);\n"
        "}\n"
        "// depende de clases concretas\n"
        "// ensamblaje duplicado en cada vista"
    ),
    despues=(
        "// data.providers.ts (una sola vez):\n"
        "const listUsersFactory =\n"
        "  (repo: UserRepository) =>\n"
        "    new ListUsersUseCase(repo);\n\n"
        "export const ListUsersUseCaseProvider = {\n"
        "  provide: ListUsersUseCase,\n"
        "  useFactory: listUsersFactory,\n"
        "  deps: [UserRepository],\n"
        "};"
    ),
)

# --- 4. ADAPTER ---
pattern_why_slide(
    4, TOTAL, "Adapter", "Estructural",
    "¿Por qué se usó?",
    [
        "La forma del backend (Entity) y la de la UI (Model) son distintas.",
        "Concentra la traducción en un lugar: no se repite en cada vista (DRY).",
        "La UI no conoce dependencyId ni cómo se arma el nombre completo.",
    ],
    diag_adapter,
)
pattern_code_slide(
    4, TOTAL, "Adapter",
    antes=(
        "<!-- Conversión a mano en la plantilla -->\n"
        "<td>{{ u.firstName }} {{ u.lastName }}</td>\n"
        "<td>{{ resolveDependencyName(\n"
        "         u.dependencyId) }}</td>\n\n"
        "// y en el .ts, repetido por vista:\n"
        "resolveDependencyName(id: number) {\n"
        "  const d = this.deps\n"
        "    .find(x => x.id === id);\n"
        "  return d ? d.name : 'Sin dependencia';\n"
        "}"
    ),
    despues=(
        "// UserResponseMapper (Mapper<I,O>):\n"
        "public mapFrom({ entity, dependencies }) {\n"
        "  const dependency = dependencies\n"
        "    .find(d => d.id === entity.dependencyId)\n"
        "    ?? { id: 0, name: 'Sin dependencia' };\n"
        "  return {\n"
        "    ...entity,\n"
        "    fullName:\n"
        "      `${entity.firstName} ${entity.lastName}`,\n"
        "    dependency,\n"
        "  };\n"
        "}"
    ),
)

# --- 5. BUILDER ---
pattern_why_slide(
    5, TOTAL, "Builder", "Creacional",
    "¿Por qué se usó?",
    [
        "El request cambia según la operación (crear, editar, filtrar, estado).",
        "Arma el body paso a paso; un filtro nuevo = un método encadenable (OCP).",
        "asNewUser() encapsula la regla de negocio «usuario nuevo nace Activo».",
    ],
    diag_builder,
)
pattern_code_slide(
    5, TOTAL, "Builder",
    antes=(
        "// Body armado a mano en cada operación:\n"
        "// crear (regla suelta en la UI):\n"
        "const body = {\n"
        "  firstName: this.firstName,\n"
        "  lastName:  this.lastName,\n"
        "  email:     this.email,\n"
        "  dependencyId: this.dependencyId,\n"
        "  status: 'Activo',  // regla repetida\n"
        "};\n"
        "// editar: casi igual pero SIN status\n"
        "// (fácil de olvidar y pisar el estado)"
    ),
    despues=(
        "// UserRequestBuilder encadenable:\n"
        "// crear:\n"
        "new UserRequestBuilder()\n"
        "  .withPersonalData(data)\n"
        "  .asNewUser()      // regla 'Activo'\n"
        "  .build();\n\n"
        "// editar (sin status):\n"
        "new UserRequestBuilder()\n"
        "  .withPersonalData(data)\n"
        "  .build();"
    ),
)

# ---------------------------------------------------------- guardar
import os
out = os.path.join(os.path.dirname(__file__), "Usuarios-Empresa-App.pptx")
prs.save(out)
print("OK ->", out, "| slides:", len(prs.slides._sldIdLst))
