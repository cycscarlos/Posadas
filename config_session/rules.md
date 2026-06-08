# Reglas de trabajo

1. **No puedes modificar código sin mi autorización.**
2. **Solo estas autorizado a trabajar con los archivos locales.**
3. **No estas autorizado a ejecutar el comando `git push`.**
4. **Modificación masiva (2+ archivos en un solo mensaje/tarea):**
   - Debes crear un commit **checkpoint** antes de comenzar.
   - El mensaje del commit debe usar el formato: `checkpoint: <breve descripción de lo que se hará>`
   - Esto permite un rollback inmediato vía `git revert` o `git restore`.
5. **Modificación de un solo archivo (aunque sea una línea):**
   - Debes hacer un backup del archivo original antes de modificarlo.
   - El backup se guarda en `backups/` con el formato `<archivo>.<YYYYMMDD-HHmmss>.bak`.
   - Ejemplo: `backups/page.tsx.20260601-120000.bak`.
6. **Rollback:**
   - Para solicitar un rollback, indicame qué checkpoint (por su mensaje) o qué backup (por su nombre) quieres restaurar.
   - Yo lo ejecutaré automáticamente.
   - Después del rollback ejecutaré `tsc --noEmit` para verificar que el estado restaurado es funcional.
7. **Memory file (`memory.md`):**
   - `memory.md` contiene el contexto compacto de la sesión para continuidad entre sesiones de OpenCode.
   - Debe actualizarse al final de cada sesión o cuando yo te lo solicite.
   - Vive en la raíz del proyecto junto a `rules.md` y `opencode.json`.

8. **Consulta obligatoria antes de ejecutar acciones:**
   - No puedo iniciar/detener servicios (MySQL, servidor Node, etc.), modificar código, crear archivos, ejecutar scripts o probar la aplicación sin tu **autorización explícita**.
   - Debo preguntar: *"¿Lo hago yo o prefieres hacerlo tú?"*
   - Esto aplica a cualquier acción que afecte el estado del proyecto o del entorno de desarrollo.

9. **Ciclo post-cambios:**
   - Después de realizar los cambios, **tú pruebas la aplicación** y me informas el resultado.
   - Si el resultado es **positivo** (funciona correctamente) → Yo hago un commit **checkpoint** con el formato `checkpoint: <breve descripción de lo realizado>`.
   - Si el resultado es **negativo** pero el error es puntual y acotado (ej: un campo no acepta cierto formato, un mensaje en consola, un estilo roto) → solo corrijo el error específico que me indicas, sin revertir todo.
   - Si el resultado es **negativo** y la página o la aplicación se rompe por completo (no carga, crash, white screen) → revierto los cambios automáticamente usando los backups o el checkpoint previo, e informo para que podamos corregir desde cero.
   - El ciclo se repite hasta obtener un resultado positivo.
