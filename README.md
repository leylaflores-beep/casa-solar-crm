# Casa Solar CRM

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

Las cuentas `leyla.flores@gmail.com` y `ligiaeugeniamolina@gmail.com` tienen rol de Jefe. Las demás cuentas autorizadas tienen rol de Vendedor. El sistema no permite registro público; las cuentas se crean desde Firebase Authentication.

## Clientes anteriores y campañas

- En **Contactos → Importar Excel**, una jefa puede cargar archivos `.xls`, `.xlsx` o `.csv`, revisar posibles duplicados y decidir si omitirlos o actualizarlos.
- Cada contacto incluye el permiso de promociones: pendiente, aceptado o no contactar.
- En **Equipo** se registra el número de WhatsApp propio de cada vendedor.
- En **Campañas** se crea un enlace individual por cliente y se registra vendedor, número del vendedor, fecha de envío, acceso, solicitud y uso del beneficio.
- Las imágenes nuevas se comprimen y se guardan en Firestore; no se utiliza Firebase Storage ni funciones de pago.

Para que el seguimiento público funcione, publique también el archivo `firestore.rules` desde **Firebase → Firestore Database → Reglas**.

## GitHub Pages

El proyecto incluye un flujo automático en `.github/workflows/deploy.yml`. Después de subir todos los archivos a GitHub, abre **Settings → Pages**, selecciona **GitHub Actions** como fuente y espera a que termine el proceso de publicación.

## Cotizaciones y órdenes de pedido

- Numeración automática anual `CS-AAAA-0001`.
- Vigencia de 30 días y precios con IVA incluido.
- Varias líneas por cotización con producto, descripción, tamaño, cantidad, precio de lista y precio cotizado.
- PDF comercial basado en el formato corporativo negro, blanco y rojo de Casa Solar.
- Orden de pedido tamaño oficio con 16 líneas; el tamaño aparece junto a “Calentador solar”.
- Acciones para descargar PDF, abrir WhatsApp, abrir correo y generar la orden.
- Registro interno en Firebase de fecha, hora, canal, destinatario y usuario que realizó cada acción.

WhatsApp y el programa de correo no permiten adjuntar automáticamente archivos desde una página web. Primero se descarga el PDF y luego se adjunta manualmente antes de enviar; el CRM conserva el registro interno de la acción.
