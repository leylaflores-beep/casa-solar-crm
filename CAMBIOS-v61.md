# Casa Solar CRM v61

## Visibilidad de vendedores corregida

- Los contactos ya no dependen únicamente de que el nombre del vendedor coincida exactamente.
- Se reconoce la propiedad mediante correo, UID vinculado y nombre normalizado.
- Los accesos antiguos sin correo guardado en Equipo se enlazan automáticamente usando los contactos creados por ese correo.
- La misma regla se aplica al Panel, Contactos, Cotizaciones, Seguimientos, Reportes, Campañas y Calculadora de rutas.
- Los usuarios Jefe mantienen acceso a toda la información.
- Cada vendedor continúa viendo únicamente sus registros.

## Instalación

Dentro de la carpeta `src` de GitHub, reemplazar:

- `CasaSolarCRM.jsx`
- `Campaigns.jsx`
- `firebase.js`

Esperar las marcas verdes en Actions. Después, cerrar sesión, actualizar con `Ctrl + F5` e ingresar nuevamente.
