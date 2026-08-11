import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Gift, Image as ImageIcon, Mail, MessageCircle, Plus, RefreshCw, Send, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";
import {
  createCampaignLink, getCampaignLink, getPublicCampaign, markCampaignAccess,
  markCampaignBenefitUsed, requestCampaignBenefit, savePublicCampaign,
} from "./firebase.js";

export const DEFAULT_CAMPAIGN = {
  id: "fidelizacion-2026",
  nombre: "Fidelización Casa Solar 2026",
  beneficio: "Beneficio exclusivo para clientes de Casa Solar",
  condiciones: "Promoción sujeta a condiciones y disponibilidad.",
  validaHasta: "2026-08-31",
  imageUrl: "./campaigns/fidelizacion-2026.png",
  createdAt: new Date().toISOString(),
  createdBy: "Casa Solar",
  sends: [],
};

const clean = value => String(value ?? "").trim();
const normalize = value => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const phoneDigits = value => clean(value).replace(/\D/g, "").replace(/^502/, "");
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), b => b.toString(16).padStart(2, "0")).join("");
const valueBy = (row, names) => {
  const entry = Object.entries(row).find(([key]) => names.includes(normalize(key)));
  return entry ? clean(entry[1]) : "";
};

export function ExcelImportModal({ contactos, currentUser, onImport, onClose }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("skip");
  const parseFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const raw = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      const parsed = raw.map(row => {
        const nombre = valueBy(row, ["nombre", "razonsocial"]) || valueBy(row, ["cliente"]);
        const fisica = valueBy(row, ["direccionfisica", "direccion"]);
        const aldea = valueBy(row, ["aldea"]);
        const municipio = valueBy(row, ["municipio"]);
        const departamento = valueBy(row, ["departamento"]);
        const producto = valueBy(row, ["producto"]);
        const precio = valueBy(row, ["precio"]);
        const promocion = valueBy(row, ["promocion"]);
        const pago = valueBy(row, ["formadepago"]);
        return {
          nombre, telefono: phoneDigits(valueBy(row, ["telefono", "celular", "movil"])), email: valueBy(row, ["email", "correo", "correoelectronico"]),
          direccion: [fisica, aldea, municipio].filter(Boolean).join(", "), departamento,
          municipio, productoComprado: producto, precioCompra: precio, promocionCompra: promocion, formaPagoCompra: pago,
          productoInteres: "calentadores", canal: "Base histórica", estado: "Cliente anterior",
          vendedor: currentUser.nombre, permisoPromociones: "Pendiente de confirmar", fecha: new Date().toISOString().slice(0, 10),
          notas: [producto && `Producto anterior: ${producto}`, precio && `Precio: ${precio}`, promocion && `Promoción: ${promocion}`, pago && `Forma de pago: ${pago}`].filter(Boolean).join(" · "),
        };
      }).filter(item => item.nombre && item.nombre !== "0");
      const existingPhones = new Set(contactos.map(c => phoneDigits(c.telefono)).filter(Boolean));
      setRows(parsed.map(item => ({ ...item, duplicate: item.telefono ? existingPhones.has(item.telefono) : contactos.some(c => normalize(c.nombre) === normalize(item.nombre)) })));
      setError(parsed.length ? "" : "No se encontraron clientes válidos en la primera hoja.");
    } catch (e) { setError(`No se pudo leer el archivo: ${e.message}`); }
  };
  const duplicateCount = rows.filter(r => r.duplicate).length;
  return <div className="modal-overlay" onClick={onClose}><div className="modal modal-wide" onClick={e => e.stopPropagation()}>
    <div className="modal-head"><div><h3>Importar clientes desde Excel</h3><small>Compatible con archivos de QuickBooks .xls, .xlsx y .csv</small></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
    <div className="modal-body">
      <label className="upload-box"><Upload size={22}/><strong>Seleccionar archivo de clientes</strong><input type="file" accept=".xls,.xlsx,.csv" onChange={parseFile}/></label>
      {error && <div className="alert-error">{error}</div>}
      {rows.length > 0 && <>
        <div className="import-summary"><strong>{rows.length}</strong> registros válidos · <strong>{duplicateCount}</strong> posibles duplicados</div>
        <label className="field-label">Cuando exista el cliente</label><select className="input" value={mode} onChange={e => setMode(e.target.value)}><option value="skip">No duplicar; conservar el actual</option><option value="update">Actualizar los campos disponibles</option></select>
        <div className="preview-scroll"><table className="table small"><thead><tr><th>Cliente</th><th>Teléfono</th><th>Ubicación</th><th>Producto anterior</th><th>Resultado</th></tr></thead><tbody>{rows.slice(0, 12).map((r, i) => <tr key={i}><td>{r.nombre}</td><td>{r.telefono || "—"}</td><td>{r.departamento || r.municipio || "—"}</td><td>{r.productoComprado || "—"}</td><td>{r.duplicate ? "Posible duplicado" : "Nuevo"}</td></tr>)}</tbody></table></div>
        {rows.length > 12 && <small>Se muestran 12 de {rows.length} registros.</small>}
      </>}
    </div>
    <div className="modal-foot"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={!rows.length} onClick={() => onImport(rows, mode)}><Upload size={16}/> Importar {rows.length} clientes</button></div>
  </div></div>;
}

const compressImage = file => new Promise((resolve, reject) => {
  const reader = new FileReader(); reader.onerror = reject; reader.onload = () => {
    const image = new Image(); image.onerror = reject; image.onload = () => {
      const max = 1200, scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", .72));
    }; image.src = reader.result;
  }; reader.readAsDataURL(file);
});

function CampaignModal({ currentUser, onSave, onClose }) {
  const [form, setForm] = useState({ nombre: "Promoción Casa Solar", beneficio: "", condiciones: "Promoción sujeta a condiciones y disponibilidad.", validaHasta: "" });
  const [imageData, setImageData] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const save = async () => {
    setBusy(true); const id = `camp-${Date.now().toString(36)}`;
    const publicData = { ...form, id, imageData, createdAt: new Date().toISOString() };
    await savePublicCampaign(publicData);
    onSave({ ...form, id, createdAt: publicData.createdAt, createdBy: currentUser.nombre, sends: [] });
    setBusy(false);
  };
  return <div className="modal-overlay" onClick={onClose}><div className="modal modal-wide" onClick={e => e.stopPropagation()}>
    <div className="modal-head"><h3>Nueva campaña</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
    <div className="modal-body"><div className="form-grid"><div><label className="field-label">Nombre de la campaña</label><input className="input" value={form.nombre} onChange={e=>set("nombre",e.target.value)}/></div><div><label className="field-label">Válida hasta</label><input className="input" type="date" value={form.validaHasta} onChange={e=>set("validaHasta",e.target.value)}/></div></div>
      <label className="field-label">Descuento o beneficio ofrecido</label><textarea className="input" rows={2} value={form.beneficio} onChange={e=>set("beneficio",e.target.value)} placeholder="Ej. Mantenimiento con precio especial o accesorio sin costo"/>
      <label className="field-label">Condiciones</label><textarea className="input" rows={2} value={form.condiciones} onChange={e=>set("condiciones",e.target.value)}/>
      <label className="upload-box"><ImageIcon size={22}/><strong>{imageData ? "Cambiar imagen" : "Seleccionar imagen de campaña"}</strong><input type="file" accept="image/*" onChange={async e => { const f=e.target.files?.[0]; if(f) setImageData(await compressImage(f)); }}/></label>{imageData && <img className="campaign-preview" src={imageData}/>}<small>La imagen se comprime para conservar el plan gratuito.</small>
    </div><div className="modal-foot"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy || !form.nombre || !form.beneficio || !imageData} onClick={save}>{busy ? "Guardando…" : "Crear campaña"}</button></div>
  </div></div>;
}

function SendCampaignModal({ campaign, contactos, currentUser, onSent, onClose }) {
  const eligible = contactos.filter(c => c.permisoPromociones !== "No contactar");
  const [contactId, setContactId] = useState(eligible[0]?.id || "");
  const [channel, setChannel] = useState("WhatsApp");
  const send = async () => {
    const contact = contactos.find(c => c.id === contactId); if (!contact) return;
    const phone = phoneDigits(contact.telefono);
    if (channel === "WhatsApp" && !phone) return window.alert("Este cliente no tiene teléfono.");
    if (channel === "Correo" && !contact.email) return window.alert("Este cliente no tiene correo.");
    const token = randomToken();
    await createCampaignLink(token, { campaignId: campaign.id, contactId: contact.id, seller: currentUser.nombre, sellerPhone: currentUser.telefono || "", createdAt: new Date().toISOString() });
    const url = new URL(window.location.href); url.search = `?promo=${token}`; url.hash = "";
    const advisorPhone = currentUser.telefono ? `\nWhatsApp del asesor: ${currentUser.telefono}` : "";
    const text = `☀️ ¡Hola, ${contact.nombre}!\n\nEn Casa Solar valoramos mucho su confianza. Por eso queremos ofrecerle un beneficio exclusivo, preparado especialmente para nuestros clientes.\n\nConozca cómo puede disfrutar el confort y ahorro que ofrece la energía solar. ♻️🏠\n\n👉 Acceda a su promoción aquí:\n${url.toString()}\n\nSu asesor: ${currentUser.nombre}${advisorPhone}\n\n*${campaign.condiciones || "Promoción sujeta a condiciones y disponibilidad."}*`;
    onSent({ id: token, token, contactoId: contact.id, contactoNombre: contact.nombre, vendedor: currentUser.nombre, vendedorTelefono: currentUser.telefono || "", canal: channel, sentAt: new Date().toISOString() });
    if (channel === "WhatsApp") {
      window.open(`https://wa.me/502${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(campaign.nombre)}&body=${encodeURIComponent(text)}`;
    }
    onClose();
  };
  return <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><h3>Enviar campaña</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div><div className="modal-body"><label className="field-label">Cliente</label><select className="input" value={contactId} onChange={e=>setContactId(e.target.value)}>{eligible.map(c=><option key={c.id} value={c.id}>{c.nombre} · {c.permisoPromociones || "Pendiente"}</option>)}</select><label className="field-label">Canal</label><select className="input" value={channel} onChange={e=>setChannel(e.target.value)}><option>WhatsApp</option><option>Correo</option></select><div className="privacy-note">Se creará un enlace individual. El código no contiene el nombre ni el teléfono del cliente.</div></div><div className="modal-foot"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={!contactId} onClick={send}><Send size={16}/> Crear enlace y enviar</button></div></div></div>;
}

export function CampaignsView({ campaigns, contactos, currentUser, onChange }) {
  const [showCreate, setShowCreate] = useState(false), [sending, setSending] = useState(null), [states, setStates] = useState({}), [publicData, setPublicData] = useState({});
  const refresh = async () => {
    const sends = campaigns.flatMap(c => c.sends || []);
    const linkEntries = await Promise.all(sends.map(async s => [s.token, await getCampaignLink(s.token)]));
    const campaignEntries = await Promise.all(campaigns.map(async c => [c.id, await getPublicCampaign(c.id)]));
    setStates(Object.fromEntries(linkEntries)); setPublicData(Object.fromEntries(campaignEntries));
  };
  useEffect(() => { refresh(); }, [campaigns.length]);
  const updateCampaign = updated => onChange(campaigns.map(c => c.id === updated.id ? updated : c));
  return <div><div className="page-head row"><div><h2>Campañas</h2><p>Fidelización, promociones y seguimiento de beneficios.</p></div><button className="btn-primary" onClick={()=>setShowCreate(true)}><Plus size={16}/> Nueva campaña</button></div>
    <div className="campaign-grid">{campaigns.map(c => { const data=publicData[c.id] || c; const sent=c.sends?.length||0; const opened=(c.sends||[]).filter(s=>states[s.token]?.accessedAt).length; const requested=(c.sends||[]).filter(s=>states[s.token]?.benefitRequestedAt).length; return <div className="campaign-card" key={c.id}>{(data.imageData||data.imageUrl) && <img src={data.imageData||data.imageUrl}/>}<div className="campaign-content"><h3>{c.nombre}</h3><p>{c.beneficio}</p><div className="campaign-kpis"><span><strong>{sent}</strong> enviados</span><span><strong>{opened}</strong> accesos</span><span><strong>{requested}</strong> solicitudes</span></div><div className="row"><button className="btn-primary" onClick={()=>setSending(c)}><MessageCircle size={15}/> Enviar</button><button className="btn-ghost" onClick={refresh}><RefreshCw size={14}/> Actualizar</button></div></div>{sent>0 && <div className="campaign-log"><table className="table small"><thead><tr><th>Cliente</th><th>Vendedor</th><th>Enviado</th><th>Acceso</th><th>Beneficio</th></tr></thead><tbody>{c.sends.map(s=>{const st=states[s.token]||{}; return <tr key={s.id}><td>{s.contactoNombre}</td><td>{s.vendedor}</td><td>{new Date(s.sentAt).toLocaleDateString("es-GT")}</td><td>{st.accessedAt?"Sí":"No"}</td><td>{st.usedBenefit?"Utilizado":st.benefitRequestedAt?<button className="btn-ghost small" onClick={async()=>{await markCampaignBenefitUsed(s.token,true);refresh();}}>Marcar utilizado</button>:"Sin solicitar"}</td></tr>})}</tbody></table></div>}</div>})}</div>
    {showCreate && <CampaignModal currentUser={currentUser} onClose={()=>setShowCreate(false)} onSave={c=>{onChange([c,...campaigns]);setShowCreate(false);}}/>}
    {sending && <SendCampaignModal campaign={sending} contactos={contactos} currentUser={currentUser} onClose={()=>setSending(null)} onSent={send=>updateCampaign({...sending,sends:[send,...(sending.sends||[])]})}/>}<style>{CAMPAIGN_CSS}</style>
  </div>;
}

export function PublicPromotion({ token }) {
  const [state,setState]=useState({loading:true});
  useEffect(()=>{(async()=>{try{const link=await getCampaignLink(token); if(!link) return setState({loading:false,error:"Promoción no encontrada."}); const campaign=await getPublicCampaign(link.campaignId); if(!campaign) return setState({loading:false,error:"Esta campaña ya no está disponible."}); await markCampaignAccess(token); setState({loading:false,link:{...link,accessedAt:new Date().toISOString()},campaign});}catch(e){setState({loading:false,error:"No fue posible abrir la promoción. Verifique el enlace."});}})();},[token]);
  if(state.loading)return <div className="public-promo center">Cargando promoción…</div>;
  if(state.error)return <div className="public-promo center"><h2>{state.error}</h2></div>;
  const {campaign,link}=state; const requested=link.benefitRequestedAt;
  return <div className="public-promo"><div className="promo-box">{(campaign.imageData||campaign.imageUrl)&&<img src={campaign.imageData||campaign.imageUrl}/>}<h1>{campaign.nombre}</h1><h2>{campaign.beneficio}</h2><p>{campaign.condiciones}</p>{requested?<div className="success-box">✅ Su beneficio quedó solicitado. Un asesor de Casa Solar se comunicará con usted.</div>:<button onClick={async()=>{await requestCampaignBenefit(token);setState(prev=>({...prev,link:{...prev.link,benefitRequestedAt:new Date().toISOString()}}));}}>QUIERO UTILIZAR MI BENEFICIO</button>}<small>Casa Solar · Energías Limpias</small></div><style>{CAMPAIGN_CSS}</style></div>;
}

const CAMPAIGN_CSS = `
.upload-box{border:2px dashed #d8d3c8;border-radius:10px;padding:22px;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;background:#faf9f6;margin:8px 0 14px}.upload-box input{display:none}.alert-error{background:#fce8e8;color:#8a1118;padding:10px;border-radius:8px}.import-summary,.privacy-note{background:#f7f5f0;padding:11px;border-radius:8px;margin:10px 0}.preview-scroll{max-height:300px;overflow:auto}.campaign-preview{display:block;max-width:360px;max-height:260px;object-fit:contain;margin:10px auto}.campaign-grid{display:grid;gap:18px}.campaign-card{background:white;border:1px solid #e5e1d8;border-radius:13px;overflow:hidden}.campaign-card>img{width:260px;height:220px;object-fit:cover;float:left;margin-right:18px}.campaign-content{padding:18px}.campaign-kpis{display:flex;gap:20px;margin:15px 0}.campaign-kpis span{background:#f7f5f0;padding:8px 12px;border-radius:8px}.campaign-log{clear:both;padding:0 16px 16px}.public-promo{min-height:100vh;background:#f4f1eb;display:flex;justify-content:center;align-items:center;padding:24px;font-family:Arial,sans-serif}.public-promo.center{text-align:center}.promo-box{max-width:720px;background:white;padding:20px;border-radius:18px;text-align:center;box-shadow:0 12px 40px #0002}.promo-box>img{width:100%;border-radius:12px}.promo-box h1{color:#e30613}.promo-box h2{color:#222}.promo-box button{background:#e30613;color:white;border:0;border-radius:30px;padding:17px 25px;font-weight:800;font-size:17px;cursor:pointer}.promo-box small{display:block;margin-top:18px;color:#666}.success-box{background:#e8f5e9;color:#205c27;padding:16px;border-radius:10px;font-weight:700}@media(max-width:720px){.campaign-card>img{width:100%;height:auto;float:none;margin:0}.campaign-kpis{flex-wrap:wrap}}
`;
