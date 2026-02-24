# E-Commerce con VTO (Virtual Try-On)

Este es un proyecto completo de comercio electrónico (E-Commerce) que integra la funcionalidad de probarse productos en tiempo real mediante Realidad Aumentada (Virtual Try-On), usando tecnologías web modernas y modelos 3D.

## Estructura del Proyecto

El repositorio está dividido en dos partes principales:

1. **`backend/`**: La API REST desarrollada con **Django**. Administra la base de datos de productos, los archivos 3D de los lentes, metadatos y configuraciones.
2. **`frontend/`**: La interfaz de usuario desarrollada en **Next.js**. Consume la API de Django y renderiza el catálogo, detalles de productos y la experiencia de AR utilizando MediaPipe y React Three Fiber.

---

## 🚀 Requisitos Previos
- **Node.js** (v18 o superior)
- **Python** (v3.10 o superior)
- **Git**

---

## ⚙️ Cómo iniciar el Backend (Django)

1. Ingresa a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea y activa tu entorno virtual:
   ```bash
   # En Windows
   python -m venv venv
   .\venv\Scripts\activate
   # En macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Instala las dependencias necesarias:
   ```bash
   pip install -r requirements.txt
   ```
   *(Nota: si no cuentas con un `requirements.txt`, instalar con `pip install django djangorestframework django-cors-headers pillow`)*
4. Realiza las migraciones de base de datos:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```
   El backend estará disponible en `http://localhost:8000`. Puedes ingresar al panel de administración en `http://localhost:8000/admin`.

---

## 🌐 Cómo iniciar el Frontend (Next.js)

1. Abre una **nueva ventana/pestaña** en tu terminal e ingresa al frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Prepara tus variables de entorno basados en `.env.example`:
   Copia el archivo `frontend/.env.example` y renómbralo a `frontend/.env` si deseas hacer cambios locales.
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El frontend estará disponible en `http://localhost:3000`.

---

## 📦 Despliegue en Vercel
Dentro de la carpeta `frontend/` encontrarás una guía detallada para desplegar libremente este proyecto en la plataforma Vercel: [Ver `frontend/README_VERCEL.md`](./frontend/README_VERCEL.md).
