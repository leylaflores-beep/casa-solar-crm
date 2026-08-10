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

## GitHub Pages

El proyecto incluye un flujo automático en `.github/workflows/deploy.yml`. Después de subir todos los archivos a GitHub, abre **Settings → Pages**, selecciona **GitHub Actions** como fuente y espera a que termine el proceso de publicación.
