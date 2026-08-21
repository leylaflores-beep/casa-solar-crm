# Casa Solar CRM v63

## Recuperación de campañas

- Recupera automáticamente campañas desde sus copias individuales en `public_campaigns`.
- Combina las campañas por ID sin duplicarlas.
- Conserva los registros de envío disponibles en la lista compartida.
- Nunca reemplaza una lista válida por una lista vacía.
- Agrega el botón **Recuperar campañas** para usuarios Jefe.
- Mantiene las imágenes fuera del documento compartido para reducir su peso en Firebase.
- Si no existen copias recuperables, conserva la campaña predeterminada sin afectar contactos, cotizaciones o seguimientos.

## Uso

Después de instalar, abra **Campañas** como Leyla o Ligia y pulse **Recuperar campañas**. El CRM indicará cuántas encontró y cuántas recuperó.

## Instalación

Dentro de `src` en GitHub, reemplazar `CasaSolarCRM.jsx`, `Campaigns.jsx` y `firebase.js`. Esperar las marcas verdes en Actions, cerrar sesión, actualizar con `Ctrl + F5` e ingresar nuevamente.
