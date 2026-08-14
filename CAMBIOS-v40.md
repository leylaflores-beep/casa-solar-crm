# Casa Solar CRM v40

## Modificación del correo de usuarios

- En **Equipo** aparece el correo de acceso de cada usuario y puede editarse.
- El botón **Guardar correo** valida que el formato sea correcto y que no esté asignado a otro colaborador.
- Al confirmar el cambio, el acceso anterior queda suspendido y se crea el acceso con el correo nuevo.
- El correo nuevo recibe un enlace seguro para establecer su contraseña.
- El correo principal de Leyla está protegido para evitar que se pierda accidentalmente el acceso administrativo.

## Eliminación definitiva de contactos

- Los usuarios con rol **Jefe** pueden abrir un contacto y seleccionar **Eliminar definitivamente**.
- Antes de borrar, el CRM muestra cuántas cotizaciones, órdenes y seguimientos se eliminarán.
- Para confirmar es obligatorio escribir `ELIMINAR`.
- La eliminación se realiza en una sola transacción e incluye el contacto, cotizaciones/órdenes, seguimientos y referencias en campañas.
- Si la operación falla, no se realiza una eliminación parcial.
- Un contacto nuevo que todavía no se ha guardado puede descartarse cerrando o cancelando el formulario; después de guardarlo puede eliminarse con el mismo procedimiento.

## Validación

- Compilación de producción verificada con Vite.
