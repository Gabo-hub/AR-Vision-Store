# Motor Principal AR (AR Engine Core)

Este documento detalla la lógica matemática, de seguimiento y de renderizado que conforma el "secreto" del motor de AR Try-On. Esta arquitectura está diseñada para ser completamente agnóstica del framework de presentación (React, Vue, Vanilla HTML, WordPress).

## 1. Sistema de Seguimiento Facial (Tracking System)

El motor utiliza **MediaPipe FaceMesh** de Google para obtener un seguimiento en tiempo real y ultraligero del rostro del usuario, procesando todo localmente en el navegador.

- **Precisión:** Devuelve un mapa 3D de 468 puntos faciales de anclaje (landmarks).
- **Anclaje de Lentes:** Para el cálculo de la posición y rotación de los anteojos, utilizamos promedios de coordenadas de los siguientes índices clave:
  - **Puente nasal (Nose bridge):** Índices `168`, `6` para anclar el centro del modelo.
  - **Ojos (Eyes):** Distancias interpupilares para determinar la escala dinámica.
  - **Orejas / Sienes (Temples):** Índices `234` (izquierda) y `454` (derecha) para anclar las patillas.
- **Pose Estimation (Rotación):** Calculamos los ángulos de Euler (Pitch, Yaw, Roll) mediante la proyección ortogonal de los landmarks de los ojos, nariz y barbilla para replicar el movimiento exacto de la cabeza humana.

## 2. Estabilización de Movimiento (1Euro Filter)

Uno de los principales problemas del seguimiento facial web es el *jitter* (temblor), especialmente en condiciones de baja iluminación. Para solucionarlo, el motor implementa un filtro de señal adaptativo estándar de la industria AR: **El Filtro 1€ (One Euro Filter)**.

### ¿Cómo funciona?
Es un filtro paso-bajo adaptativo que actúa basándose en la velocidad del movimiento:
- **Movimientos Lentos:** Aumenta el suavizado para eliminar el temblor natural de la cabeza y el ruido de la cámara (`minCutOff`).
- **Movimientos Rápidos:** Disminuye el suavizado para evitar el *lag* o latencia visual, manteniendo el modelo anclado a la cara cuando el usuario se mueve rápido (`beta`).

## 3. Calidad Visual "Studio" (Renderizado y PBR)

El motor de renderizado utiliza **Three.js**, configurado para un nivel fotorrealista. Este es el diferenciador principal para un producto comercial de e-commerce.

### Configuración del Motor WebGL (`WebGLRenderer`):
- `antialias: true`: Evita bordes dentados (jagged edges).
- `preserveDrawingBuffer: true`: Requisito fundamental para permitir tomar "capturas de pantalla" (fotos del usuario con los lentes puestos).
- `dpr`: Configurado para respetar pantallas de alta densidad (Retina Displays) limitando a un máximo de `2.0` para equilibrar rendimiento y nitidez.
- **Espacio de Color y Mapeo Tonos:**
  - `outputColorSpace = THREE.SRGBColorSpace` (Asegura colores fidedignos de los materiales).
  - `toneMapping = THREE.ACESFilmicToneMapping` (Mapeo de color cinematográfico para evitar zonas quemadas por luz blanca).

### Sistema de Iluminación y Reflejos
Los materiales de los anteojos (marcos de metal, lentes de vidrio) requieren entorno para verse realistas.
- **Luz Base:** `AmbientLight` suave y `DirectionalLight` para contornos (rim-light).
- **Environment Mapping (IBL):** Generamos un mapa de entorno dinámico utilizando `PMREMGenerator` y `RoomEnvironment` de Three.js. Esto inyecta reflejos hiperrealistas de un estudio fotográfico en todas las superficies reflectantes del modelo (vidrios, acetatos, metales).

## 4. Recorrido y Corrección de Materiales (Traversal)

Al cargar modelos 3D (`.glb`), las configuraciones de los softwares de modelado no siempre funcionan en WebGL. El motor corrige esto dinámicamente mediante la iteración (Traversal):

```javascript
model.traverse((child) => {
    if (child.isMesh && child.material) {
        // Corrección de Z-Fighting en vidrios transparentes
        child.material.depthWrite = !child.material.transparent;
        if (!child.material.transparent) {
            child.material.side = THREE.DoubleSide; // Marcos visibles por dentro
        }
        child.material.envMapIntensity = 1.2; // Aumento de brillo en metales/cristales
        child.renderOrder = 2; // Forzar el renderizado por delante del oclusor
    }
});
```

## 6. Persistencia y Estrategia de Singleton (WASM)

Para optimizar el rendimiento y evitar errores críticos de memoria en el navegador, el motor implementa un patrón de **Persistencia de Contexto WASM**.

### El Problema de la "Muerte del WASM"
MediaPipe FaceMesh carga binarios WASM pesados. Si el objeto `FaceMesh` se destruye (`.close()`), el navegador aborta el contexto de ejecución. Intentar reiniciarlo en la misma sesión de página suele provocar errores de tipo `Wasm Runtime Error` o archivos no encontrados (`ENOENT`), ya que los scripts de soporte ya están inyectados pero en estado abortado.

### La Solución aplicada
Hemos abstraído el `FaceMesh` en un **Singleton a nivel de módulo** dentro de `FaceTracker.js`:
- **Inicialización única:** El motor matemático se inicializa solo la primera vez que se solicita el tracker.
- **Teardown No Destructivo:** Al detener el motor (`engine.stop()`), cerramos el stream de la cámara y detenemos el renderizado, pero mantenemos el objeto `FaceMesh` en memoria.
- **Callback Hot-Swap:** Cada vez que se crea un nuevo `FaceTracker` (ej. al reabrir el diálogo), este se vincula al singleton existente y reemplaza el callback de resultados (`onResults`), permitiendo una reactivación instantánea sin recargar binarios.
