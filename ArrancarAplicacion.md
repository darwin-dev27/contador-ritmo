# Contador Ritmo

Este es el proyecto "Contador Ritmo", una aplicación de entrenamiento para triatletas con un frontend en React (Vite) y un backend en Django.

A continuación encontrarás las instrucciones para arrancar todos los servicios del proyecto rápidamente en tu entorno de desarrollo local.

## 🚀 Cómo arrancar el proyecto

Necesitarás abrir **dos terminales** diferentes en la carpeta principal del proyecto (`C:\Users\Ghio\Desktop\Proyectos\contador-ritmo`).

### 1. Arrancar el Backend (Django)

En la primera terminal, navega a la carpeta del backend, activa el entorno virtual y arranca el servidor:

```bash
# 1. Entrar a la carpeta del backend
cd backend

# 2. Activar el entorno virtual (usando PowerShell en Windows)
.\venv\Scripts\Activate.ps1
# Nota: Si usas Símbolo del sistema (CMD), el comando es: .\venv\Scripts\activate.bat

# 3. Arrancar el servidor de Django
python manage.py runserver
```

El backend estará disponible en `http://127.0.0.1:8000/`.


### 2. Arrancar el Frontend (React + Vite)

Abre una **segunda terminal** en la carpeta raíz del proyecto (`contador-ritmo`) y ejecuta el servidor de desarrollo de Vite:

```bash
# Asegúrate de estar en la raíz de contador-ritmo y arranca el frontend
npm run dev
```

El frontend estará disponible normalmente en `http://localhost:5173/` (o el puerto que indique la terminal).
