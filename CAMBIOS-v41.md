# Casa Solar CRM v41

## Usuario especial de Samuel Lemus

- El CRM identifica los registros llamados **Samuel Lemus** y los correos relacionados con su acceso.
- Si existen registros duplicados, los consolida en un solo integrante del equipo.
- El usuario consolidado conserva las funciones de **Jefe técnico** y **Vendedor**.
- Samuel puede utilizar contactos, cotizaciones, reportes, seguimientos y campañas, además de órdenes técnicas e informes.
- En **Equipo** aparece la marca **Usuario especial**.
- Si todavía está registrado el correo incorrecto `casasolar.bodegagt@gmail.com`, aparece el botón **Corregir correo de Samuel**.
- La corrección crea el acceso con `casasolar.bodega.gt@gmail.com`, suspende el acceso anterior y envía al correo correcto el enlace para establecer la contraseña.

## Administración de usuarios

- Leyla puede editar el correo de acceso de los colaboradores.
- Se agregó un selector para cambiar el rol y crear combinaciones especiales de **Jefe técnico + Vendedor**.
- Los cambios de rol también se guardan en el perfil de acceso de Firebase.
- La contraseña inicial puede ser definida y mostrada u ocultada al crear un usuario.
- Por seguridad, las contraseñas existentes no pueden consultarse ni ser escritas directamente por otra persona desde una aplicación cliente; se cambian mediante el enlace seguro de restablecimiento.

## Pantalla de ingreso

- Cada usuario puede mostrar u ocultar la contraseña antes de presionar **Entrar al CRM**.
- Si se escribe el correo anterior de Samuel, el CRM muestra cuál es el correo correcto.

## Validación

- Compilación de producción verificada con Vite.
