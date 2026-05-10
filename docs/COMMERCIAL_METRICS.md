# Métricas Comerciales y de Rendimiento (ROI)

Vender un software B2B de Virtual Try-On requiere demostrar que el producto genera retorno de inversión (ROI). Los clientes (e-commerce y marcas de moda/óptica) no compran tecnología por lo "avanzada" que es, la compran porque **aumenta las ventas y reduce las devoluciones**.

El motor AR debe exponer eventos (Event Hooks) a los que las herramientas de analítica del cliente (Google Analytics, Mixpanel, PostHog, Facebook Pixel) puedan suscribirse fácilmente.

## 1. Métricas de Rendimiento del E-commerce (Conversión)

Esta es la data principal que utilizarás para vender la herramienta.

### A. Tasa de "Add to Cart" tras interactuar con AR
- **Concepto:** Medir cuántos usuarios que abren el probador virtual terminan añadiendo el producto al carrito.
- **Evento del Motor:** `onARSessionEnd(duration, didAddToCart)`
- **Objetivo Comercial:** Demostrar que los clientes que usan AR tienen una tasa de conversión (CVR) hasta un 40% mayor que los que solo ven fotografías.

### B. Reducción de Tasa de Devoluciones (Return Rate)
- **Concepto:** A largo plazo (seguimiento a 3-6 meses), el e-commerce notará que los productos comprados usando AR se devuelven menos, ya que el usuario tuvo una idea real del tamaño y proporción de las gafas.

### C. Tiempo de Retención y Engagement
- **Concepto:** ¿Cuánto tiempo pasan los usuarios jugando con el probador y probándose distintos colores?
- **Evento del Motor:** `onTimeSpentInAR(seconds)`
- **Objetivo Comercial:** Aumentar el "Time on Site", lo cual beneficia el SEO de la tienda y la probabilidad estadística de compra.

## 2. Métricas de Salud Tecnológica (Performance)

Aparte de las métricas comerciales, tu SaaS debe recolectar métricas técnicas para detectar problemas antes que los clientes se quejen.

### A. Tasa de Permisos de Cámara Otorgados (Camera Grant Rate)
- **Evento:** `onCameraPermission(status)` (Status: `Granted`, `Denied`, `Error`).
- **Problema a detectar:** Si la tasa de denegación es muy alta (ej. 50%), significa que el mensaje de la UI que pide la cámara no genera confianza o la web no tiene SSL. 

### B. Time to First Frame (TTFF)
- **Concepto:** Tiempo que transcurre desde que el usuario aprieta el botón de "Pruébatelos" hasta que aparece la cámara renderizada con los lentes.
- **Factores de Riesgo:** El peso del modelo 3D (`.glb`), la inicialización pesada de MediaPipe. Si el TTFF supera los 3 segundos, se pierde hasta el 40% de los usuarios.

### C. Frames Per Second (FPS) y Crashes
- **Concepto:** Medir la fluidez del motor de renderizado y el detector facial en los dispositivos reales del mundo.
- **Evento:** Envío pasivo promediado de `fps`. Si en dispositivos iOS 12 o gamas medias de Android los FPS caen por debajo de 24, el algoritmo debería activar automáticamente gráficos más bajos (desactivar antialias, bajar el DPR a 1.0).

---

## 3. Integración Técnica de los Eventos (API de Analíticas)

El motor debe despachar Eventos de Custom JavaScript en el DOM, o invocar callbacks pasados en la configuración.

```javascript
// Ejemplo de configuración comercial ideal
const tryOn = new AREngine({
    apiKey: 'sk_123',
    onEvent: (eventName, data) => {
        // El desarrollador del sitio cliente conecta esto a su herramienta favorita
        if (eventName === 'CAMERA_GRANTED') {
            mixpanel.track('AR Started', { product_id: data.productId });
        }
        
        if (eventName === 'AR_ERROR') {
            Sentry.captureMessage(`Fallo en dispositivo: ${data.errorMessage}`);
        }
    }
});
```
