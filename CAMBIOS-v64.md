# Cambios v64

## Cotizaciones

- El teléfono del cliente puede modificarse dentro de cada cotización sin cambiar el contacto original.
- Se guarda el nombre real y el teléfono del asesor como datos propios de la cotización.
- El PDF muestra el nombre del asesor en vez del correo o nombre técnico de acceso.
- El lápiz actualiza únicamente el producto seleccionado en el borrador.
- El botón final **Guardar cambios** envía la cotización completa a Firebase con el total recalculado.
- Se conserva correctamente un precio de lista igual a cero cuando fue ingresado de forma intencional.
- Los productos de transporte quedan clasificados como servicios.

## PDF

- Los comentarios y condiciones comerciales se dividen automáticamente en varias líneas.
- Las columnas de productos respetan el ancho útil de la página.
- Los bloques extensos continúan en una nueva página cuando es necesario.

## Rendimiento y protección de cambios

- Los generadores de PDF se cargan únicamente al descargar un documento, reduciendo el peso inicial del CRM.
- La actualización se construyó sobre la versión acumulativa v63; conserva contactos, campañas, rutas, permisos, calculadoras y flujos existentes.

## Verificación

- Compilación de producción completada correctamente.
- Cotización de prueba renderizada y revisada visualmente sin texto cortado.
