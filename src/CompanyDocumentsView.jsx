import { useMemo, useState } from "react";
import { CheckCircle2, Download, Edit3, FileText, Plus, ShieldCheck, Upload } from "lucide-react";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayISO = () => new Date().toISOString().slice(0, 10);
const TYPES = [
  "Informe técnico",
  "Informe administrativo",
  "Carta de permiso para condominio",
  "Carta para espacio publicitario",
  "Carta para activación",
  "Carta general",
];
const blankDocument = () => ({
  id: "", numero: "", tipo: TYPES[0], estado: "Borrador", fecha: todayISO(), contactoId: "",
  clienteNombre: "", clienteTelefono: "", clienteNit: "", clienteDireccion: "",
  destinatario: "", cargoDestinatario: "", lugar: "", asunto: "", titulo: "",
  contenido: "", observaciones: "", usarMembrete: true, incluirFirma: true, incluirSello: true,
});

function compressOfficialImage(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) return reject(new Error("Selecciona una imagen PNG, JPG o WEBP."));
    if (file.size > 6 * 1024 * 1024) return reject(new Error("La imagen no puede superar 6 MB."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("La imagen no es válida."));
      image.onload = () => {
        const scale = Math.min(1, 720 / image.width, 360 / image.height);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff"; context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function CompanyDocumentsView({ records = [], assets = {}, contactos = [], currentUser, onSave, onSaveAssets, onDownload }) {
  const [form, setForm] = useState(blankDocument);
  const [saving, setSaving] = useState(false);
  const ordered = useMemo(() => [...records].sort((a, b) => String(b.actualizadoEn || b.creadoEn).localeCompare(String(a.actualizadoEn || a.creadoEn))), [records]);
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const selectContact = id => {
    const contact = contactos.find(item => item.id === id);
    setForm(previous => ({ ...previous, contactoId: id, clienteNombre: contact?.nombre || previous.clienteNombre, clienteTelefono: contact?.telefono || previous.clienteTelefono, clienteNit: contact?.nit || previous.clienteNit, clienteDireccion: contact?.direccion || previous.clienteDireccion }));
  };
  const nextNumber = () => {
    const year = new Date().getFullYear();
    const max = records.reduce((value, item) => {
      const match = String(item.numero || "").match(new RegExp(`^DOC-${year}-(\\d+)$`));
      return match ? Math.max(value, Number(match[1])) : value;
    }, 0);
    return `DOC-${year}-${String(max + 1).padStart(4, "0")}`;
  };
  const save = async () => {
    if (!form.clienteNombre.trim() || !form.asunto.trim() || !form.contenido.trim()) return window.alert("Completa cliente, asunto y contenido del documento.");
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await onSave({ ...form, id: form.id || uid(), numero: form.numero || nextNumber(), creadoEn: form.creadoEn || now, creadoPor: form.creadoPor || currentUser.nombre, actualizadoEn: now, actualizadoPor: currentUser.nombre });
      setForm(blankDocument());
      window.alert("Documento guardado correctamente.");
    } catch (error) {
      console.error("No se pudo guardar el documento:", error);
      window.alert("No se pudo guardar. No se modificó ningún documento anterior.");
    } finally { setSaving(false); }
  };
  const uploadAsset = async (key, file) => {
    if (!file) return;
    try {
      const compressed = await compressOfficialImage(file);
      await onSaveAssets({ ...assets, [key]: compressed, [`${key}Nombre`]: file.name, actualizadoEn: new Date().toISOString(), actualizadoPor: currentUser.nombre });
      window.alert(`${key === "firma" ? "Firma" : "Sello"} guardado y optimizado.`);
    } catch (error) { window.alert(error.message); }
  };
  const edit = item => { setForm({ ...blankDocument(), ...item }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const field = (label, key, type = "text") => <label><span className="field-label">{label}</span><input className="input" type={type} value={form[key] || ""} onChange={event => set(key, event.target.value)} /></label>;

  return <div>
    <div className="page-head"><h2>Documentos e informes de la empresa</h2><p>Informes y cartas oficiales. Acceso privado para Jefatura y Samuel.</p></div>
    <div className="section-card company-assets">
      <div className="section-title"><ShieldCheck size={18}/><div><h3>Firma y sello oficiales</h3><p>Se guardan una sola vez y las imágenes se comprimen para mantener rápido el CRM.</p></div></div>
      <div className="document-assets-grid">
        {[["firma", "Firma autorizada"], ["sello", "Sello de la empresa"]].map(([key, label]) => <div className="official-asset" key={key}><strong>{label}</strong>{assets[key] ? <img src={assets[key]} alt={label}/> : <span>Sin imagen</span>}<label className="btn-secondary small"><Upload size={14}/> {assets[key] ? "Reemplazar" : "Subir"}<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={event => uploadAsset(key, event.target.files?.[0])}/></label><small>{assets[`${key}Nombre`] || "PNG o JPG"}</small></div>)}
      </div>
    </div>
    <div className="section-card">
      <div className="section-title"><FileText size={18}/><div><h3>{form.id ? `Editar ${form.numero}` : "Crear documento"}</h3><p>Puede elaborarse en hoja membretada y descargarse como PDF.</p></div></div>
      <div className="form-grid">
        <label><span className="field-label">Tipo de documento</span><select className="input" value={form.tipo} onChange={event => set("tipo", event.target.value)}>{TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
        {field("Fecha", "fecha", "date")}
        <label><span className="field-label">Cliente registrado</span><select className="input" value={form.contactoId} onChange={event => selectContact(event.target.value)}><option value="">Escribir datos manualmente</option>{contactos.map(contact => <option key={contact.id} value={contact.id}>{contact.nombre}</option>)}</select></label>
        <label><span className="field-label">Estado</span><select className="input" value={form.estado} onChange={event => set("estado", event.target.value)}><option>Borrador</option><option>Final</option><option>Enviado</option></select></label>
        {field("Nombre del cliente", "clienteNombre")}{field("Teléfono", "clienteTelefono")}{field("NIT", "clienteNit")}{field("Dirección", "clienteDireccion")}
        {field("Destinatario", "destinatario")}{field("Cargo o entidad", "cargoDestinatario")}{field("Lugar", "lugar")}{field("Título", "titulo")}
      </div>
      {field("Asunto", "asunto")}
      <label><span className="field-label">Informe o carta completa</span><textarea className="input company-document-body" rows="14" value={form.contenido} onChange={event => set("contenido", event.target.value)} placeholder="Escribe aquí el informe completo, antecedentes, evaluación, conclusiones, solicitud o contenido de la carta…"/></label>
      <label><span className="field-label">Observaciones internas</span><textarea className="input" rows="3" value={form.observaciones} onChange={event => set("observaciones", event.target.value)}/></label>
      <div className="document-options"><label><input type="checkbox" checked={form.usarMembrete} onChange={event => set("usarMembrete", event.target.checked)}/> Hoja membretada</label><label><input type="checkbox" checked={form.incluirFirma} onChange={event => set("incluirFirma", event.target.checked)}/> Incluir firma</label><label><input type="checkbox" checked={form.incluirSello} onChange={event => set("incluirSello", event.target.checked)}/> Incluir sello</label></div>
      <div className="modal-actions"><button className="btn-secondary" onClick={() => setForm(blankDocument())}><Plus size={15}/> Nuevo</button><button className="btn-primary" disabled={saving} onClick={save}><CheckCircle2 size={15}/> {saving ? "Guardando…" : "Guardar documento"}</button></div>
    </div>
    <div className="section-card"><h3>Historial de documentos</h3>{ordered.length ? <div className="company-document-list">{ordered.map(item => <div className="company-document-row" key={item.id}><div><strong>{item.numero} · {item.tipo}</strong><span>{item.clienteNombre} · {item.asunto}</span><small>{item.fecha} · {item.estado} · actualizado por {item.actualizadoPor || item.creadoPor}</small></div><button className="icon-btn" onClick={() => edit(item)} title="Editar"><Edit3 size={15}/></button><button className="btn-secondary small" onClick={() => onDownload(item)}><Download size={14}/> PDF</button></div>)}</div> : <div className="empty-state">Aún no hay documentos guardados.</div>}</div>
  </div>;
}
