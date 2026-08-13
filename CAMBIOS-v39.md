# Casa Solar CRM v39

## Equipo, usuarios y contraseñas

- La contraseña inicial puede mostrarse u ocultarse durante la creación del usuario.
- Las contraseñas ya guardadas no se muestran ni se recuperan; Firebase las protege de forma irreversible.
- El botón **Restablecer** envía al correo del colaborador un enlace seguro para definir una contraseña nueva.
- Cada colaborador muestra su estado **Activo** o **Suspendido**.
- **Suspender** bloquea el acceso al CRM, cierra la sesión activa y conserva contactos, ventas, órdenes y seguimientos.
- **Reactivar** devuelve el acceso al colaborador.
- **Eliminar** retira al colaborador del listado del equipo, suspende su acceso y conserva su historial para auditoría.
- El acceso principal de Leyla está protegido para evitar suspensión o eliminación accidental.

## Firebase

- Se agregó verificación en tiempo real del estado del usuario.
- Las reglas de Firestore bloquean a usuarios suspendidos.
- Es necesario publicar el archivo `firestore.rules` actualizado al instalar esta versión.

## Validación

- Compilación de producción verificada con `npm run build`.
