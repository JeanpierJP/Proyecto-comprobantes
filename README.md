# 📄 Proyecto Facturas - Frontend

Aplicación web moderna y dinámica diseñada para gestionar, procesar y visualizar facturas con una interfaz intuitiva y muy atractiva. Es la cara visual del Sistema Integral de Gestión y Extracción de Datos de Asistencias.

## 🚀 Características Principales

- **Dashboard Interactivo**: Visualización en tiempo real de facturas procesadas.
- **Subida de Archivos con Drag & Drop**: Soporte para cargar documentos e imágenes (PDF, JPG, PNG).
- **Diseño Premium**: Interfaz moderna implementando Glassmorphism, animaciones fluidas y soporte para modo oscuro.
- **Exportación de Datos**: Posibilidad de descargar todos los registros directamente a un archivo Excel.
- **Gestión de Registros**: Opciones para limpiar datos y actualizar estados de facturas procesadas.

## 🛠️ Tecnologías Utilizadas

- **React 19**: Framework de interfaz de usuario.
- **Vite 7.2**: Servidor de desarrollo ultrarrápido y empaquetador.
- **Tailwind CSS 3.4**: Framework CSS de utilidades para un diseño rápido y responsivo (con componentes personalizados).
- **Axios**: Cliente HTTP para consumir la API del backend.
- **XLSX**: Generación y manejo de archivos Excel en el navegador.
- **Lucide React / Heroicons**: Iconografía moderna y limpia.
- **Sonner**: Sistema de notificaciones (Toasts) amigables.

## 📦 Estructura del Proyecto

```text
frontend/
├── src/
│   ├── components/      # Componentes reutilizables de UI
│   ├── App.jsx          # Componente principal y enrutador
│   ├── InvoicesDashboard.jsx # Vista principal de gestión de facturas
│   ├── InvoicesDashboard.css # Estilos personalizados y animaciones
│   └── main.jsx         # Punto de entrada de React
├── package.json         # Dependencias y scripts
├── vite.config.js       # Configuración de Vite
└── tailwind.config.js   # Configuración y tema de Tailwind
```

## ⚙️ Instalación y Uso

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
Crea un archivo `.env` en la raíz del frontend con la URL de tu backend (por ejemplo, en local o Render):
```env
VITE_API_URL=http://localhost:8000
```

3. **Ejecutar en entorno de desarrollo**:
```bash
npm run dev
```

4. **Construir para producción**:
```bash
npm run build
```
