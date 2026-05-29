# 🏁 TriCalc Pro — Contador de Ritmo y Bitácora para Triatletas

¡Bienvenido a **TriCalc Pro** (Contador de Ritmo)! Esta es una plataforma web completa de alto rendimiento diseñada específicamente para triatletas y deportistas de fondo. Permite registrar entrenamientos manuales e importaciones premium de archivos `.FIT`, planificar competiciones en un calendario interactivo, visualizar analíticas dinámicas y llevar un control inteligente de la vida útil del material deportivo.

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una arquitectura limpia y desacoplada de Cliente-Servidor:

*   **Frontend:** React 18, Vite, Recharts (gráficos vectoriales interactivos), Lucide React (iconografía premium), Vanilla CSS (diseño responsivo con glassmorphic y animaciones).
*   **Backend:** Django 6 (Python 3.10+), Django REST Framework, Simple JWT (Autenticación por Tokens), SQLite3 (Base de datos local segura), Fitparse (procesador binario de archivos FIT).

---

## 🚀 Guía de Instalación Limpia desde Cero

Sigue detalladamente estos pasos secuenciales para replicar el entorno de desarrollo y levantar la aplicación de forma local.

### 📋 Requisitos Previos
Asegúrate de tener instalado en tu sistema:
*   [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
*   [Python](https://www.python.org/) (Versión 3.10 o superior)
*   Git (Opcional, para clonación)

---

### 1️⃣ Clonación y Preparación
Clona el repositorio o extrae el proyecto en tu carpeta de preferencia y sitúate en la raíz del mismo:
```bash
git clone https://github.com/tu-usuario/contador-ritmo.git
cd contador-ritmo
```

---

### 2️⃣ Configuración del Backend (Django)

Abre una **primera terminal** y realiza las siguientes acciones:

#### A. Acceder a la carpeta del backend:
```bash
cd backend
```

#### B. Crear el entorno virtual de Python:
```bash
python -m venv venv
```

#### C. Activar el entorno virtual:
*   **En Windows (PowerShell):**
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
*   **En Windows (CMD / Símbolo del Sistema):**
    ```cmd
    .\venv\Scripts\activate.bat
    ```
*   **En Linux / macOS:**
    ```bash
    source venv/bin/activate
    ```

#### D. Instalar los requisitos del sistema:
```bash
pip install -r requirements.txt
```

#### E. Crear la estructura inicial de la base de datos (Migraciones):
```bash
python manage.py makemigrations
python manage.py migrate
```

#### F. Crear un súper usuario administrador (Opcional, para el panel Django):
```bash
python manage.py createsuperuser
```

#### G. Ejecutar la suite de pruebas unitarias para validar que todo esté correcto:
```bash
python manage.py test
```
*(Deberías ver un mensaje con el resultado `OK` indicando que los tests de integración pasaron correctamente).*

#### H. Arrancar el servidor de desarrollo del backend:
```bash
python manage.py runserver
```
El backend estará disponible y escuchando en `http://127.0.0.1:8000/`.

---

### 3️⃣ Configuración del Frontend (React + Vite)

Abre una **segunda terminal** en la carpeta **raíz** del proyecto (`contador-ritmo`):

#### A. Instalar las dependencias de Node.js:
```bash
npm install
```

#### B. Arrancar el servidor de desarrollo de Vite:
```bash
npm run dev
```
La aplicación web se compilará y estará disponible en el navegador en la dirección `http://localhost:5173/`.

---

## 🔒 Auditoría de Seguridad y Blindaje Académico

Este proyecto incorpora prácticas recomendadas para entregas de proyectos finales y despliegue en entornos de producción:

1.  **requirements.txt:** Todas las dependencias de Python requeridas están explícitamente declaradas.
2.  **Exclusión de Base de Datos:** `.gitignore` está optimizado para excluir archivos compilados `__pycache__` y la base de datos local `db.sqlite3` del control de versiones.
3.  **Desacoplamiento de Claves:** El archivo `settings.py` consume la variable de entorno `DJANGO_SECRET_KEY` y `DJANGO_DEBUG` de forma dinámica mediante `os.environ`.
4.  **Políticas CORS Dinámicas:** El intercambio de recursos (CORS) solo se permite de manera abierta en entornos de desarrollo (`DEBUG = True`), bloqueándose y requiriendo orígenes autorizados en producción.
