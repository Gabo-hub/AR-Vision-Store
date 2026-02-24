# 🗺️ Plan de Ejecución de Desarrollo: E-Commerce con VTO (Virtual Try-On)

Este documento es la **hoja de ruta paso a paso** diseñada para que un agente de programación pueda seguir la construcción del proyecto en orden lógico.

**Regla General:** El desarrollo comenzará construyendo toda la lógica y estructura necesaria en el **Backend (Django)**, y una vez finalizado y probado, se procederá a consumir y renderizar desde el **Frontend (Next.js)**.

---

## FASE 1: DESARROLLO DEL BACKEND (Django)

El objetivo de esta fase es tener una API REST funcional que sirva los productos (lentes) y sus metadatos (archivos 3D, posiciones, escalas) listos para ser consumidos por el cliente.

### Paso 1.1: Configuración Inicial de Django y Base de Datos
1. Configurar `core/settings.py` para incluir `rest_framework` y `corsheaders` en `INSTALLED_APPS`.
2. Configurar CORS (Cross-Origin Resource Sharing) para permitir peticiones desde `http://localhost:3000` (puerto por defecto de Next.js).
3. Configurar la gestión de archivos estáticos y media (`MEDIA_URL` y `MEDIA_ROOT`) para poder almacenar las imágenes y los archivos `.glb` o `.gltf` de los lentes.

### Paso 1.2: Creación de la Aplicación `products`
1. Crear una nueva app llamada `products` (`python manage.py startapp products`).
2. Diseñar el modelo `Glasses` (Lentes) en `models.py`. Debería incluir campos como:
   - `name` (Char)
   - `description` (Text)
   - `price` (Decimal)
   - `thumbnail` (Image)
   - `model_3d_file` (File, para el `.glb`)
   - Datos de anclaje AR (FloatFields o JSONField) como: `scale_factor`, `offset_x`, `offset_y`, `offset_z`.

### Paso 1.3: Serializadores y Endpoints (API REST)
1. Crear `serializers.py` en la app `products` para serializar el modelo `Glasses` usando `ModelSerializer`.
2. Crear `views.py` utilizando ViewSets (`ModelViewSet` o `ReadOnlyModelViewSet`) de Django REST Framework.
3. Configurar `urls.py` de la app y enlazarlo al `urls.py` del proyecto (`core`).

### Paso 1.4: Panel de Administración y Datos semilla
1. Registrar el modelo `Glasses` en `admin.py` para permitir la carga de lentes desde el panel de Django Admin.
2. (Opcional) Crear un script o *fixture* para cargar al menos 2 modelos de prueba en la base de datos y facilitar el desarrollo del Frontend.

**Hito:** Al finalizar la Fase 1, se debe poder acceder a `http://localhost:8000/api/products/` y ver un JSON con los lentes disponibles, sus imágenes y los links a sus modelos 3D.

---

## FASE 2: DESARROLLO DEL FRONTEND (Next.js)

El objetivo de esta fase es crear la interfaz de comercio electrónico que conecte con la API de Django y, posteriormente, integrar el probador AR.

### Paso 2.1: Estructura Base y Servicios de API
1. Crear un servicio (ej. `src/lib/api.ts`) para manejar las peticiones `fetch` o `axios` hacia `http://localhost:8000/api/`.
2. Definir los tipos e interfaces de TypeScript en `src/types/` que coincidan con la respuesta del JSON del backend.

### Paso 2.2: Interfaz de Tienda (Catálogo)
1. Crear el layout principal (Header con logo/carrito, Footer).
2. Crear la página principal (`src/app/page.tsx`) que haga un *fetch* de los productos desde Django y los renderice en un grid (Grilla de productos).
3. Crear el componente `ProductCard` que muestre nombre, precio y miniatura.

### Paso 2.3: Interfaz de Detalles del Producto
1. Crear una ruta dinámica (`src/app/product/[id]/page.tsx`).
2. Mostrar detalles completos del lente.
3. Agregar el botón de *Call to Action* principal: **"Pruébatelos en vivo"** o **"Virtual Try-On"**.

### Paso 2.4: Integración del Probador AR (Virtual Try-On)
Se basa en las recomendaciones técnicas (`recomendaciones.md`).

1. **Configuración del Tracker:** Crear el componente `FaceTracker` usando `@mediapipe/face_mesh` para capturar la cámara y obtener los puntos faciales.
2. **Setup 3D Escena:** Crear el componente `ARScene` usando `@react-three/fiber`. Esta escena recibirá el stream de la cámara como fondo.
3. **Renderizado de los Lentes:** Crear el componente `GlassesRenderer` usando `@react-three/drei` (`useGLTF`).
   - El componente debe descargar en tiempo real el modelo 3D del lente actual usando el endpoint de Django (`product.model_3d_file`).
   - Aplicar los factores de rotación, posición (`offset`) y `scale` obtenidos de la API basándose en la ubicación del puente de la nariz calculado con MediaPipe.
4. Mostrar un selector de productos dentro de la misma cámara para cambiar de lentes sin cerrar el probador.

### Paso 2.5: Pulido UX y Manejo de Errores
1. Agregar estados de carga (Loaders) mientras se descarga el MediaPipe (WASM) y el modelo 3D.
2. Agregar mensajes claros si el usuario deniega el permiso de la cámara o si el navegador no lo soporta.

**Hito:** Al finalizar la Fase 2, un usuario debe poder entrar al Home, seleccionar unos lentes, hacer clic en "Probar", y verlos superpuestos en su rostro en tiempo real. 

---
**Nota para el Agente:** Usa este documento como base. Para el paso actual, ve dirigiéndote al **Backend**, empezando por el *Paso 1.1*. No avances de fase sin verificar que el paso anterior compile y funcione correctamente.
