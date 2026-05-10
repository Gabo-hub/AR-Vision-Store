# 📚 Ecosistema AR Try-On (Directorio de Documentación)

Bienvenido a la documentación técnica y comercial del motor **AR Try-On**. 

Para preparar la comercialización del producto y aislar la propiedad intelectual del motor de las demostraciones (E-commerce / WordPress), hemos dividido la documentación en módulos específicos.

Por favor, consulta los siguientes documentos según tus necesidades:

## 1. El Motor Core (El "Secreto")
[AR_ENGINE_CORE.md](./AR_ENGINE_CORE.md)
Documentación matemática y de renderizado sobre cómo funciona el motor puro:
- MediaPipe FaceMesh & Puntos de anclaje faciales.
- Filtro 1Euro para estabilización.
- WebGL & Configuración PBR de estudio fotográfico.
- Iteración y corrección de materiales.

## 2. Manual de Integración
[INTEGRATION_PLAYBOOK.md](./INTEGRATION_PLAYBOOK.md)
Guía técnica sobre cómo conectar el motor AR en cualquier plataforma cliente:
- Instanciación del motor en HTML Vanilla.
- Requisitos del navegador.
- Degradación elegante (Fallbacks) y UI inyectable.

## 3. Negocios y Estrategia B2B
[GO_TO_MARKET.md](./GO_TO_MARKET.md)
La estrategia de comercialización bajo el modelo SaaS:
- Licencias, Supabase y Validación de Dominio (CORS).
- Estrategia de marca blanca (Theming).
- Validación de archivos 3D (`.glb`).

## 4. Analíticas y Retorno de Inversión (ROI)
[COMMERCIAL_METRICS.md](./COMMERCIAL_METRICS.md)
Listado de métricas que debes recolectar y mostrar al cliente para justificar el precio del producto:
- Tasa de adición al carrito (Add-to-cart).
- Rendimiento de cuadros por segundo (FPS).
- Time to First Frame (TTFF).

---

> **Principio de Diseño:** La simplicidad es la máxima sofisticación. El motor AR se mantendrá siempre aislado en su propia librería y jamás mezclará su lógica matemática con la lógica de negocio del framework presentacional (React, Vue, WordPress).
