# OpticAR - Sistema de Diseño (Neo-Brutalismo Suave)

Este documento centraliza los principios, variables y reglas de estilo para mantener la coherencia visual del frontend de OpticAR, inspirado en sitios modernos y estructurados como Ben & Frank.

## 1. Principios Estéticos 🎨
- **Evitar el "Aspecto IA"**: Están prohibidos los fondos desenfocados (`backdrop-blur`), las sombras sutiles que flotan (`shadow-sm`, `shadow-lg`) y los colores en degradado.
- **Neo-Brutalismo Suave**: Uso intensivo de bordes sólidos, divisiones claras, y alto contraste. Elementos 2D que interactúan mediante desplazamientos rígidos (`translate-y`) y sombras duras.
- **Estructura Cajas (Boxy)**: Los elementos usan esquinas poco redondeadas (generalmente rectangulares) y están encapsulados en bordes oscuros de 2px de grosor.

## 2. Paleta de Colores y Variables (globals.css) 🖌️
La paleta se aloja mediante variables CSS inyectadas a Tailwind:

```css
@theme inline {
  --color-background: #fdfaf6; /* Bone white / off-white background */
  --color-foreground: #111111; /* Negro casi puro para el texto */
  --color-primary: #0000ff;    /* Azul Klein / Color vibrante para llamadas a la acción */
  --color-border: #000000;     /* Bordes estrictamente negros */
  
  /* Sombras Duras (Neo-Brutalism) */
  --shadow-solid: 4px 4px 0px 0px var(--color-border);
  --shadow-solid-hover: 6px 6px 0px 0px var(--color-border);
  --shadow-solid-sm: 2px 2px 0px 0px var(--color-border);
  --shadow-solid-btn: 3px 3px 0px 0px var(--color-border);
}
```

## 3. Tipografía 🔤
- **Fuente Principal**: `Outfit` (Desde Google Fonts).
- **Estilo de Títulos (Headings)**: Siempre en **MAYÚSCULAS** (`uppercase`) y con el máximo peso (`font-black`).
- **Textos Secundarios**: Deben usar tracking ajustado (`tracking-tighter`) en títulos muy grandes y peso de fuente medio/bold (`font-medium` o `font-bold`) para legibilidad sobre fondos blancos.

## 4. Estilos de Componentes 🧩

### Botones Principales (CTAs)
Los botones deben parecer bloques de un cómic o panel 2D:
- **Clases Base**: `bg-primary text-white font-black uppercase border-2 border-border px-8 py-3.5`
- **Estado Normal**: Deben tener una sombra dura constante: `shadow-[var(--shadow-solid-btn)]`.
- **Estado Hover**: Se elevan y la sombra crece: `transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)]`.
- **Estado Active (Click)**: El botón se hunde y pierde la sombra: `active:translate-y-0 active:shadow-none`.

### Tarjetas de Productos (ProductCards)
- Fondo Sólido Blanco.
- Borde negro de 2px: `border-2 border-border`.
- **Hover de Tarjeta**: Aplica el efecto de la sombra sólida en lugar de difuminarla: `hover:-translate-y-1 hover:shadow-[var(--shadow-solid-hover)]`.
- Las viñetas (Ej. "Nuevo") deben ser de corte afilado con sombra pequeña: `border-2 border-border shadow-[var(--shadow-solid-sm)]`.

### Formularios e Inputs (Login / Admin)
- Nunca usar `ring-opacity` suave. En su lugar, el `focus` debe cambiar el color del borde de forma seca.
- **Clases Input**: `w-full px-4 py-3 border-2 border-border focus:ring-0 focus:border-primary transition-colors outline-none bg-zinc-50 font-medium`.
- **Etiquetas (Labels)**: Siempre en negrita y mayúsculas (`text-sm font-black uppercase`).

### Iconos
- Usar iconos de `lucide-react`.
- Aumentar el grosor de línea para que igualen el peso de la fuente `Outfit`: `stroke-[2.5px]`.

---
*Este documento debe ser consultado por cualquier desarrollador antes de crear un nuevo componente visual para garantizar que la estética flat/neo-brutalista se mantenga intacta en toda la aplicación.*
