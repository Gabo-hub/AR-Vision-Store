# 📋 DOCUMENTACIÓN TÉCNICA ESTRUCTURAL
## Sistema de E-Commerce con Probador VTO (Virtual Try-On)

Este documento define la estructura en la cual nos basaremos para el desarrollo de la aplicación que integrará la compra de lentes con un probador AR en tiempo real. 

### 1. ARQUITECTURA DEL SISTEMA Y PRINCIPIOS
Basándonos en nuestras _skills_ de arquitectura, seguiremos el principio fundamental: **"La simplicidad es la máxima sofisticación"**. Empezaremos con una arquitectura base simple y añadiremos complejidad solo cuando sea estrictamente necesario.

El proyecto estará conformado por dos ecosistemas separados, comunicados a través de una API REST:

**Frontend (Next.js / React)**
- Se encarga de la interfaz gráfica de la tienda (E-commerce).
- Controla el acceso a la cámara y el motor de renderizado AR usando **Three.js** y **React Three Fiber**.
- Realiza el seguimiento facial mediante inteligencia artificial corriendo en el navegador (**MediaPipe Face Mesh**).
- Estructura recomendada: Next.js 14 App Router, TypeScript y Tailwind CSS.

**Backend (Django / Python)**
- Se encarga de la gestión de inventario, productos y usuarios.
- Expone los datos hacia el frontend mediante una API REST (**Django REST Framework**).
- Almacenaría los metadatos de los modelos 3D y configuraciones.

### 2. ESTRUCTURA DE DIRECTORIOS PRINCIPAL
```text
Proyecto Ecommerce/
├── documentacion_tecnica.md   # Este documento, sirviendo de mapa
├── recomendaciones.md         # Archivo original con las especificaciones AR 
├── frontend/                  # Next.js App
│   ├── public/                # Modelos 3D y recursos estáticos
│   └── src/
│       ├── app/               # App Router (layout.tsx, page.tsx, globals.css)
│       ├── components/        # Componentes UI (catálogo) y AR (FaceTracker, GlassesRenderer)
│       ├── hooks/             # Custom hooks (useMediaPipe, useThree)
│       ├── lib/               # Utilidades generales y configuración de clientes API
│       └── types/             # Tipados principales de TypeScript
└── backend/                   # Django App
    ├── core/                  # Configuraciones generales de Django (settings.py)
    ├── api/                   # Lógica e interfaces de REST (views, serializers, models)
    ├── media/                 # Archivos estáticos cargados (modelos GLB)
    └── venv/                  # Entorno virtual de Python aislado para el backend
```

### 3. DEPENDENCIAS PRINCIPALES
**En Frontend:**
- `next`, `react`, `react-dom`
- `three`, `@react-three/fiber`, `@react-three/drei`
- `@mediapipe/face_mesh`, `@mediapipe/camera_utils`
- `tailwindcss` para dar un diseño visual de primer nivel, moderno y responsive.

**En Backend:**
- `Django`, `djangorestframework`
- `django-cors-headers` (Fundamental para permitir a Next.js leer la API si se desarrollan en puertos distintos localmente).

### 4. FLUJO DE DESARROLLO (NUESTROS SIGUIENTES PASOS)
1. **Andamiaje (Scaffolding):** Creación de la estructura base (carpetas `frontend` con Next.js y `backend` con Django). *(En progreso)*
2. **Interfaz Base Frontend:** Diseño de la tienda web (Homepage y Catálogo) implementando vistas placeholder y un estilo visual muy premium a la altura de un e-commerce moderno.
3. **Punto de Entrada AR:** Construcción de la interfaz donde el usuario va a verse con la cámara interactiva (UI para iniciar prueba)
4. **Acoplamiento de MediaPipe y Three.js:** Construcción lógica del probador real para procesar rostros.
5. **Base de Datos y API:** Construcción del inventario dinámico de modelos de lentes en Django.
