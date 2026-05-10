# Manual de Integración Universal (Playbook)

Este documento explica cómo integrar el **Motor AR Try-On** en cualquier plataforma. El diseño del sistema "Atomizado" garantiza que la plataforma de presentación y el motor matemático 3D estén separados.

## 1. Vía Rápida: React (Recomendado)

Para aplicaciones React, el paquete `@ar-project/react-ar-wrapper` provee un componente de alto nivel que maneja el botón de activación, el modal (Dialog) y el ciclo de vida de la cámara automáticamente.

```jsx
import { ARTryOnButton } from '@ar-project/react-ar-wrapper';

function ProductPage() {
  return (
    <ARTryOnButton
      apiKey="sk_live_12345"
      modelUrl="https://tuservidor.com/modelos/lente-01.glb"
      productName="Lentes Aviador Pro"
      buttonText="Pruébatelos en AR"
      showCameraSwitch={true}
      theme={{ 
        primaryColor: '#FF5733',
        backgroundColor: 'rgba(5, 5, 15, 0.88)' 
      }}
      config={{ cameraRes: 640 }}
    />
  );
}
```

## 2. Vía Manual: Vanilla JS / Otros Frameworks

Si no utilizas React, puedes integrar el motor directamente. El motor está optimizado para ser un "Singleton" interno, lo que significa que el hardware de seguimiento facial se carga una sola vez y permanece listo para sesiones posteriores.

### Ejemplo de Integración Directa

```html
<!-- 1. El Contenedor -->
<div id="ar-wrapper" style="position:relative; width: 100%; height: 500px;">
    <video id="ar-video" playsinline style="display:none;"></video>
    <div id="ar-canvas-container" style="width: 100%; height: 100%;"></div>
</div>

<script>
    import { AREngine } from '@ar-project/ar-engine-core';

    const engine = new AREngine({
        apiKey: 'sk_live_12345',
        container: document.getElementById("ar-canvas-container"),
        videoElement: document.getElementById("ar-video"),
        config: { cameraRes: 640 }
    });

    async function startExperience() {
        try {
            await engine.init(); // Valida licencia e inicia cámara
            await engine.loadModel('https://servidor.com/lente.glb');
        } catch (err) {
            console.error("Error AR:", err);
        }
    }

    function stopExperience() {
        engine.stop(); // Libera cámara pero mantiene el motor en memoria
    }
</script>
```

## 3. Arquitectura de Despliegue

La integración consta de **3 capas**:

1. **La Capa de UI (Presentación):** Gestionada por el integrador o mediante nuestro `ARTryOnButton`.
2. **El Elemento Contenedor:** Donde el Motor AR inyecta el canvas de Three.js.
3. **El Motor Core (WASM/JS):** El paquete matemático que corre en segundo plano.

## 4. Requisitos del Navegador

- **HTTPS Obligatorio**: `getUserMedia` (cámara) solo funciona en contextos seguros.
- **WebGL 2.0**: Para el renderizado de materiales PBR.

## 5. Gestión de Ciclo de Vida (Hardware)

El motor implementa un sistema de **"Graceful Teardown"**:
- Al llamar a `engine.stop()`, el stream de la cámara se cierra físicamente (el LED de privacidad se apaga).
- Los recursos de Three.js se liberan de la GPU.
- **Importante:** El motor de MediaPipe (WASM) se mantiene en un estado "dormido" pero inicializado. Esto permite que la segunda vez que el usuario abra el probador, la carga sea casi instantánea (sub-segundo).

## 6. Captura de Fotos (Snapshot)

El motor permite capturar la vista actual (Video + 3D) para compartir en redes sociales:
`const dataUri = await engine.takeSnapshot();`

## 7. Consistencia de Interfaz (UI)

Para que el sistema se vea igual en React que en WordPress, utilizamos una **Capa de Estilos Compartida**.

- **El Dialog Flotante:** Tanto en el plugin de WordPress como en el paquete React, el motor genera un modal centrado con efecto *glassmorphism*.
- **CSS Atómico:** Los estilos residen en un archivo CSS independiente que puede ser cargado por cualquier plataforma.

## 8. Integración en WordPress (Arquitectura de Seguridad)

El plugin de WordPress actúa como un **Configurador Visual** pero delega el procesamiento al Core.

### Flujo Técnico del Plugin:
1. El administrador sube el modelo `.glb` en WordPress.
2. El plugin inyecta un botón en la ficha del producto con atributos de datos:
   `<button class="ar-plugin-trigger" data-model="url_del_modelo" data-api="sk_123">...</button>`
3. El script del plugin carga el **Core Motor** desde un CDN seguro.
4. El Core detecta el botón, crea el **Dialog Flotante** y comienza el seguimiento facial.

**Seguridad:** La lógica matemática (el "secreto") nunca reside en la carpeta del plugin de WordPress, protegiendo así tu Propiedad Intelectual de copias no autorizadas.

---

> [!IMPORTANT]
> **Estado de la Lógica:** Actualmente, la lógica más actualizada se encuentra en los paquetes `@ar-project/ar-engine-core` y `@ar-project/react-ar-wrapper`. Cualquier cambio en el seguimiento facial debe hacerse primero en el `ar-engine-core` para que se propague automáticamente a WordPress y React.

