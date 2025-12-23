# Estado de Cuenta

Aplicación para la gestión y visualización de estados de cuenta, permitiendo el registro de movimientos de débito y crédito con cálculo automático de saldo.

## Características

- **Dashboard Interactivo**: Visualización de movimientos en una tabla paginada.
- **Gestión de Movimientos**: Creación, edición y eliminación de registros.
- **Cálculo Automático**: El saldo se calcula automáticamente basándose en los movimientos previos.
- **Interfaz Moderna**: Construida con Angular Material para una experiencia de usuario fluida y profesional.
- **Fecha Inteligente**: Al crear un nuevo registro, la fecha por defecto es la del último movimiento ingresado.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- `frontend/`: Aplicación Angular.
- `backend/`: API REST construida con Node.js, Express y MongoDB.

## Requisitos Previos

- Node.js (v18 o superior)
- MongoDB corriendo localmente o en la nube (Atlas)
- npm o yarn

## Instalación y Ejecución

### Backend

1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env` (puerto, URI de MongoDB).
4. Inicia el servidor:
   ```bash
   npm run dev
   ```

### Frontend

1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación:
   ```bash
   npm start
   ```
   La aplicación estará disponible en `http://localhost:4200`.

## Tecnologías Utilizadas

- **Frontend**: Angular, Angular Material, RxJS.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Base de Datos**: MongoDB.
