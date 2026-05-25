# Búnker de Inversión — Guía de trabajo

## Estructura del proyecto

- Los archivos `.js` en `Búnker de Inversión/` son los scripts de Google Apps Script
- `appsscript.json` es la configuración del proyecto de Apps Script
- `BUNKER_SISTEMA_VALORACION_COMPLETO.md` documenta la lógica de valoración del Excel

---

## Flujo de trabajo

### 1. Modificar código con Claude Code

```powershell
cd "C:\Users\admin\Documents\Claude\Projects\Proyecto APP Búnker de Inversión"
claude
```

Pide los cambios en español directamente en Claude Code.

---

### 2. Guardar cambios en GitHub

Después de cada modificación:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

---

### 3. Subir cambios a Google Apps Script

Para que los cambios se reflejen en el Google Sheet:

```bash
cd "Búnker de Inversión"
clasp push
```

Confirma con `yes` si pregunta si quieres sobreescribir.

---

### 4. Verificar cambios en Google Apps Script

1. Abre el Google Sheet
2. **Extensiones → Apps Script**
3. Verifica que el código está actualizado

---

### 5. Bajar cambios de Google a tu PC

Si modificas algo directamente en Apps Script y quieres sincronizarlo:

```bash
clasp pull
```

---

### 6. Reautenticación (si caduca la sesión)

```bash
clasp login
```

---

## Referencia rápida

| Acción | Comando |
|---|---|
| Abrir Claude Code | `claude` |
| Guardar en GitHub | `git add . && git commit -m "mensaje" && git push` |
| Subir a Google | `clasp push` |
| Bajar de Google | `clasp pull` |
| Ver estado de archivos | `git status` |
| Ver historial de cambios | `git log --oneline` |
