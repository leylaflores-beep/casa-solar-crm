# Casa Solar CRM

## Publicación oficial

El CRM se publica únicamente en Firebase Hosting mediante `.github/workflows/firebase-hosting.yml`.
La dirección oficial es `https://crm-casa-solar.web.app/`.

Para actualizar desde GitHub, sube el contenido completo del paquete conservando las carpetas
`.github`, `public` y `src`. El archivo principal debe llamarse exactamente `index.html`.

Proyecto web creado con React y Vite.

## Ejecutar en desarrollo

1. Instala Node.js 18 o superior.
2. Abre una terminal en esta carpeta.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev`.

## Crear versión para publicar

Ejecuta `npm run build`. Los archivos finales se generarán en la carpeta `dist`.

## Firebase

El CRM está conectado al proyecto `crm-casa-solar` y guarda los datos compartidos en la colección `crm_data` de Firestore. El usuario activo se guarda únicamente en el navegador de cada dispositivo.

Para activar las reglas incluidas, abre Firestore Database, entra en **Reglas**, copia el contenido de `firestore.rules` y pulsa **Publicar**. Las reglas exigen que el usuario haya iniciado sesión con una cuenta creada en Firebase Authentication.

La pantalla **Equipo** permite mostrar u ocultar la contraseña inicial, enviar restablecimientos por correo, suspender/reactivar accesos y eliminar colaboradores del listado sin borrar su historial comercial. Para que una suspensión bloquee también Firestore, publique las reglas incluidas en esta versión.

Las cuentas `leyla.flores@gmail.com` y `ligiaeugeniamolina@gmail.com` tienen rol de Jefe. Las demás cuentas autorizadas tienen rol de Vendedor. El sistema no permite registro público; las cuentas se crean desde Firebase Authentication.

## Clientes anteriores y campañas

- En **Contactos → Importar Excel**, jefes y vendedores pueden cargar archivos `.xls`, `.xlsx` o `.csv`, revisar posibles duplicados y decidir si omitirlos o actualizarlos. Los clientes cargados por un vendedor quedan asignados automáticamente a ese vendedor.
- El importador reconoce encabezados en español e inglés, elimina diferencias de tildes, mayúsculas, espacios y símbolos, y guarda la información con campos internos en español. Incluye DPI/CUI, NIT/Tax ID y Observaciones/Notes.
- Cada contacto incluye el permiso de promociones: pendiente, aceptado o no contactar.
- En **Equipo** se registra el número de WhatsApp propio de cada vendedor.
- En **Campañas** se crea un enlace individual por cliente y se registra vendedor, número del vendedor, fecha de envío, acceso, solicitud y uso del beneficio.
- Las imágenes nuevas se comprimen y se guardan en Firestore; no se utiliza Firebase Storage ni funciones de pago.

Para que el seguimiento público funcione, publique también el archivo `firestore.rules` desde **Firebase → Firestore Database → Reglas**.

## GitHub Pages

El proyecto incluye un flujo automático en `.github/workflows/deploy.yml`. Después de subir todos los archivos a GitHub, abre **Settings → Pages**, selecciona **GitHub Actions** como fuente y espera a que termine el proceso de publicación.

## Firebase Hosting gratuito

El flujo `.github/workflows/firebase-hosting.yml` publica la misma aplicación en `https://crm-casa-solar.web.app`. Para activarlo, guarda la clave de la cuenta de servicio como un secreto de GitHub llamado `FIREBASE_SERVICE_ACCOUNT_CRM_CASA_SOLAR`. No subas el archivo JSON al repositorio.

Las campañas generan enlaces individuales con el formato `https://crm-casa-solar.web.app/p/CODIGO`. Los jefes pueden seleccionar hasta diez clientes autorizados y preparar una cola; cada mensaje se abre individualmente para reducir bloqueos del navegador y de WhatsApp.

Desde Contactos, las cuentas con rol Jefe pueden seleccionar clientes visibles y asignarlos masivamente a un vendedor. Cada vendedor puede importar su propia base y preparar campañas para sus contactos asignados o importados, sin modificar clientes pertenecientes a otro vendedor.

## Cotizaciones y órdenes de pedido

- Numeración automática anual `CS-AAAA-0001`.
- Vigencia de 30 días y precios con IVA incluido.
- Varias líneas por cotización con producto, descripción, tamaño, cantidad, precio de lista y precio cotizado.
- PDF comercial basado en el formato corporativo negro, blanco y rojo de Casa Solar.
- Orden de pedido tamaño oficio con 16 líneas; el tamaño aparece junto a “Calentador solar”.
- Acciones para descargar PDF, abrir WhatsApp, abrir correo y generar la orden.
- Registro interno en Firebase de fecha, hora, canal, destinatario y usuario que realizó cada acción.

WhatsApp y el programa de correo no permiten adjuntar automáticamente archivos desde una página web. Primero se descarga el PDF y luego se adjunta manualmente antes de enviar; el CRM conserva el registro interno de la acción.

## Flujo operativo y técnico

- Una **Visita técnica presencial** permite seleccionar fecha y hora y confirmarlas con **Programar fecha y hora**; luego se dirige a la bandeja del **Jefe técnico**.
- El Jefe técnico puede asignarse a sí mismo o asignar/reasignar a otro técnico instalador.
- Cuando una orden recibe una **fecha de instalación**, aparece simultáneamente en **Programación**, **Bodega**, **Facturación** y en el calendario. Si la fecha cambia, todas las áreas ven la fecha nueva.
- El técnico asignado puede registrar la instalación realizada. El cierre exige el nombre de quien recibió el equipo y el informe del trabajo; guarda automáticamente fecha, hora, dirección y, con permiso del dispositivo, coordenadas GPS.
- Los cierres aparecen en **Informes de instalación** y se pueden descargar como PDF.
- Los técnicos comunes no pueden cambiar precios ni descargar la orden comercial. El Jefe técnico conserva permisos para modificar, guardar y descargar órdenes.

## Persistencia de la información

- Contactos, cotizaciones, seguimientos, campañas, órdenes e informes se guardan en Firestore y se sincronizan en tiempo real entre usuarios.
- Cada seguimiento nuevo se agrega individualmente para evitar que una sesión antigua reemplace el historial completo.
- El formulario de seguimiento solo se cierra después de que Firebase confirma el guardado.
- Firestore mantiene una copia local persistente para conservar información durante cortes temporales de Internet y sincronizarla al volver la conexión.
- Los seguimientos no se eliminan al cerrar sesión, cerrar el navegador o actualizar la página.
- Al abrir el CRM se revisan las órdenes existentes con instalación programada y se agrega al historial del contacto cualquier seguimiento de instalación que estuviera ausente, sin duplicarlo.
- Las reasignaciones administrativas usan una transacción para conservar los seguimientos creados simultáneamente por otros usuarios.
