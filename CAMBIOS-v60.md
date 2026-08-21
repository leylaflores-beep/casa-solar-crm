# Casa Solar CRM v60

## Recuperación de visualización de contactos

- Los contactos confirmados en `crm_data/contactos` se consultan primero directamente desde el servidor de Firebase.
- Se retiró la caché persistente que podía conservar una lista vacía después de actualizar el CRM.
- Si Firebase no entrega el documento de contactos, el CRM avisa y no lo reemplaza por una lista vacía.
- No se eliminan ni modifican los contactos existentes durante esta actualización.

## Calculadora de estructuras por altura

- En estructuras de elevación permite ingresar altura, cantidad de postes, largo de barra comercial y porcentaje de desperdicio.
- Calcula los metros de perfil y redondea hacia arriba las barras comerciales requeridas.
- Agrega el renglón calculado a la lista editable de materiales.
- Mantiene por separado base, travesaños, diagonales, anclajes y consumibles de la plantilla.
- Continúa restringida a usuarios Jefe y Samuel.

## Instalación

Subir dentro de la carpeta `src` estos tres archivos:

- `CasaSolarCRM.jsx`
- `Campaigns.jsx`
- `firebase.js`

Esperar que GitHub Actions termine en verde y después recargar el CRM con `Ctrl + F5`.
