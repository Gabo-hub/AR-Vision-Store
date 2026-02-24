# 🚀 Guía de Despliegue en Vercel

Sigue estos pasos para desplegar el **Frontend** de tu E-Commerce en Vercel:

### 1. Preparar el Repositorio
- Sube todo el código de tu proyecto a un repositorio en **GitHub**, **GitLab** o **Bitbucket**.

### 2. Importar el Proyecto en Vercel
1. Inicia sesión en [Vercel](https://vercel.com/) y haz clic en **"Add New..." > "Project"**.
2. Conecta tu cuenta de GitHub (o la plataforma que uses) y selecciona el repositorio de tu proyecto.
3. Haz clic en **"Import"**.

### 3. Configuración del Proyecto en Vercel
En la pantalla de "Configure Project":

- **Framework Preset**: Vercel debería detectar automáticamente que estás usando **Next.js**. Si no lo hace, selecciónalo de la lista.
- **Root Directory**: Dado que tu proyecto Next.js está dentro de la carpeta `frontend`, haz clic en **"Edit"** bajo "Root Directory" y selecciona la carpeta `/frontend`. Luego haz clic en "Save".
  
### 4. Variables de Entorno (Environment Variables)
- Despliega la sección **"Environment Variables"**.
- Agrega las variables que están en el archivo `frontend/.env.example`.
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://URL-DE-TU-BACKEND-EN-PRODUCCION.com` (Usa la URL donde esté subido tu backend de Django, como Render, Railway u otro).
- Haz clic en **"Add"**.

### 5. Desplegar
- Haz clic en el botón azul de **"Deploy"**.
- Vercel comenzará a construir tu aplicación. (Los errores de ESLint y TypeScript han sido configurados para no bloquear el despliegue inicial).
- ¡Listo! En un par de minutos tendrás tu ecommerce en línea.

### 💡 Notas Adicionales:
- **Imágenes**: La optimización de imágenes locales (`unoptimized: true`) en Vercel está habilitada en tu configuración para evitar errores con imágenes servidas por tu backend.
- **Backend**: Recuerda que Vercel está diseñado y optimizado para el **Frontend**. Tu backend de Django debe ser alojado en otra plataforma como **Render**, **Railway**, **Fly.io** o **DigitalOcean Apps**, y luego debes usar esa URL en la variable `NEXT_PUBLIC_API_URL` de Vercel.
