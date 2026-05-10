# Estrategia "Go-To-Market" (GTM) y Comercialización

Para transformar el motor de AR Try-On en un negocio escalable B2B (Business-to-Business) bajo el modelo SaaS, es fundamental construir las bases comerciales y de seguridad antes de lanzar el producto.

## 1. El Modelo de Negocio (SaaS) y Versiones

Para maximizar el alcance, el producto se divide en dos formatos de entrega basados en el mismo "Core":

### A. Formato "No-Code" (Plugin de WordPress / Shopify)
**Target:** Ópticas y tiendas medianas.
- **Valor:** Interfaz visual para gestionar modelos 3D, ajustes de cámara y colores sin tocar código.
- **Monetización:** Suscripción mensual (SaaS) + comisión por instalación.

### B. Formato "Pro-Code" (NPM Package / SDK)
**Target:** Agencias de software y grandes retailers con equipos de desarrollo.
- **Valor:** Integración total en aplicaciones React/Next.js personalizadas.
- **Monetización:** Licencia por volumen de peticiones o dominios.

## 2. Gestión de Licencias y Seguridad (El Backend con Supabase)

El mayor riesgo de vender un motor web es que el código fuente se carga en el frontend del cliente. Si no lo protegemos, cualquier persona podría robarse el motor de la pestaña de red de Chrome y usarlo gratis en su sitio.

### Seguridad en WordPress (Prioridad)
Dado que los plugins de WordPress son intrínsecamente abiertos por la licencia GPL, la protección de la IP se traslada al **Motor Core**:
1. **Core Externo:** El plugin de WordPress **no contiene** la lógica matemática. Solo es un "puente" que llama a un script alojado en nuestro CDN seguro.
2. **Ofuscación Agresiva:** El archivo `ar-engine.min.js` debe estar ofuscado para que sea imposible de leer o replicar.
3. **Handshake de Dominio:** Al cargar, el Core pregunta a Supabase: "¿Este dominio de WordPress tiene permiso para usar este modelo?". Si la respuesta es NO, el motor no inicializa el WASM.

### Flujo de Verificación (General)
1. **Creación de Credenciales:** En tu panel administrativo (Supabase + Next.js), cuando un cliente se suscribe, creas un nuevo `client_id` y le asignas una `API_KEY`.
2. **Ping de Validación:** El código del Motor AR inicia haciendo un POST a tu backend enviando su `API_KEY`.
3. **CORS / Origin Enforcement:** El backend verifica que el HTTP Origin del servidor solicitante coincida con la base de datos de Supabase.

### Ofuscación del Código (Post-Desarrollo)
En el futuro, cuando la arquitectura esté completamente atomizada en un paquete `ar-engine-core`, el paso final antes de publicarlo será pasarlo por herramientas como `Terser` o `JavaScript Obfuscator`. Esto hará que variables como `updateMatrixWorld` o el `OneEuroFilter` se conviertan en código ilegible (`a.b(c,d)`), haciendo que desensamblar el motor sea un dolor de cabeza gigantesco.

## 3. Estrategia de Modelos 3D (CMS)

Como definimos, **los clientes alojarán sus propios modelos `.glb`**. Esto te ahorra enormes costos de almacenamiento y banda ancha.

### Estándar de Certificación (Validation Checker)
Sin embargo, los modelos de terceros pueden venir mal exportados, sin texturas o pesando 30MB (lo que destruirá el rendimiento web). Debemos ofrecer un validador (quizás en la web de aterrizaje de nuestro servicio):
- El cliente arrastra su archivo `.glb`.
- El sistema verifica que:
  1. El peso no sea superior a 3MB.
  2. Los materiales usen el estándar `PBRMetallicRoughness`.
  3. No haya miles de vértices innecesarios.

## 4. Personalización del Frontend (Marca Blanca)

Para vender el producto a precios Premium (Plan Pro/Enterprise), las empresas necesitan que la herramienta no parezca un "plugin barato", sino una extensión natural de su sitio web.

Implementaremos la inyección de UI dinámica:
- Colores primarios (`primaryColor`).
- Estilos del botón de "Tomar Foto".
- Animación de carga (spinner vs barra de progreso).

Todo controlado a través de un objeto de configuración JavaScript inyectado por el integrador.

```javascript
const engine = new AREngine({
    apiKey: 'sk_123',
    theme: {
        primaryColor: '#000000',
        textColor: '#FFFFFF',
        borderRadius: '10px'
    }
});
```
