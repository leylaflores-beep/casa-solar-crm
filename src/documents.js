import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const money = (value) => `Q ${Number(value || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const prettyDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" }) : "-";
const itemName = (item) => {
  const description = String(item?.descripcion || "").trim();
  if (description && description.toLowerCase() !== "producto") return description;
  return item?.productoNombre || item?.producto || item?.nombre || item?.productoId || "Producto sin especificar";
};
const itemDescription = (item) => [
  itemName(item),
  item?.tamano ? `Tamaño: ${item.tamano}` : "",
  item?.altura ? `Altura: ${item.altura}` : "",
  item?.compatibilidad ? `Compatible con: ${item.compatibilidad}` : "",
].filter(Boolean).join(" - ");
const savePdf = (doc, filename) => {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export function downloadQuotePdf(quote, contact, logo) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const client = contact || quote.cliente || {};
  const red = [227, 6, 19];
  const dark = [31, 36, 39];

  doc.setFillColor(...dark);
  doc.rect(0, 0, 52, 297, "F");
  doc.setFillColor(...red);
  doc.rect(0, 282, 52, 15, "F");
  doc.addImage(logo, "PNG", 62, 10, 70, 12);
  doc.setDrawColor(205);
  doc.line(60, 28, 198, 28);

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ESPECIALISTAS EN", 9, 19);
  doc.text("ENERGÍA SOLAR", 9, 25);
  doc.setFontSize(7);
  const sidebar = [
    ["COTIZACIÓN", quote.numero],
    ["FECHA", prettyDate(quote.fecha)],
    ["VÁLIDA HASTA", prettyDate(quote.validaHasta)],
    ["CLIENTE", client.nombre || quote.contactoNombre || ""],
    ["NIT", client.nit || "C/F"],
    ["TELÉFONO", client.telefono || "Sin registrar"],
    ["CORREO", client.email || "Sin registrar"],
    ["DEPARTAMENTO", client.departamento || "Sin registrar"],
    ["DIRECCIÓN", client.direccion || "Sin registrar"],
  ];
  let sy = 42;
  sidebar.forEach(([label, value]) => {
    doc.setTextColor(...red); doc.setFont("helvetica", "bold"); doc.text(label, 9, sy);
    doc.setTextColor(255); doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(value || "-"), 37);
    doc.text(lines, 9, sy + 6);
    sy += Math.max(15, lines.length * 4 + 9);
  });
  doc.setTextColor(255); doc.setFontSize(7);
  doc.text(["CASA SOLAR", "Plaza Pericentro Zona 8,", "Quetzaltenango", "PBX 7767 5949", "info@casasolar.com.gt", "", "ASESOR(A) DE VENTAS", quote.vendedor || ""], 9, 238);
  doc.setFont("helvetica", "bold"); doc.text("www.casasolar.com.gt", 10, 291);

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("PROPUESTA COMERCIAL", 62, 46);
  doc.setTextColor(...red); doc.text("ENERGÍA SOLAR", 62, 56);
  doc.setTextColor(75); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize("Gracias por considerarnos para su proyecto. Presentamos soluciones de energía renovable con productos de calidad, garantía y atención personalizada.", 133), 62, 68);

  const body = quote.items.map(item => [
    item.cantidad,
    itemDescription(item),
    money(item.precioLista || item.precioUnitario),
    money(item.precioUnitario),
    money(item.cantidad * item.precioUnitario),
  ]);

  autoTable(doc, {
    startY: 83,
    margin: { left: 60, right: 12 },
    head: [["CANT.", "DESCRIPCIÓN", "PRECIO", "COTIZADO", "TOTAL"]],
    body,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2.6, textColor: dark },
    headStyles: { fillColor: dark, textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 13, halign: "center" }, 1: { cellWidth: 60 }, 2: { cellWidth: 23, halign: "right" }, 3: { cellWidth: 23, halign: "right" }, 4: { cellWidth: 25, halign: "right", fillColor: [252, 232, 233], fontStyle: "bold" } },
  });

  let y = doc.lastAutoTable.finalY + 9;
  if (y > 245) { doc.addPage(); y = 22; }
  if (quote.descuentoAutorizado) {
    const discount = quote.descuentoAutorizado;
    doc.setTextColor(90); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
    const label = discount.tipo === "Porcentaje" ? `${discount.valor}%` : money(discount.monto);
    doc.text(`Descuento adicional autorizado: ${label} (${money(discount.monto)})`, 198, y - 8, { align: "right" });
    y += 3;
  }
  doc.setFillColor(...red); doc.rect(150, y - 6, 48, 13, "F");
  doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(`TOTAL ${money(quote.total)}`, 194, y + 2, { align: "right" });
  doc.setTextColor(...dark); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("CONDICIONES COMERCIALES", 62, y + 19);
  doc.setFont("helvetica", "normal"); doc.setTextColor(80);
  const conditions = [
    "- Precios expresados en quetzales con IVA incluido.",
    "- Vigencia: 30 días calendario a partir de la fecha de emisión.",
    "- Disponibilidad sujeta a existencia al confirmar el pedido.",
    `- Promoción aplicada: ${quote.promocion || "Sin promoción"}.`,
    `- Garantía del producto: ${quote.garantia || (quote.garantiaAnios ? `${quote.garantiaAnios} años` : "Según condiciones del producto")}.`,
    `- ${quote.notas || "Garantía según el producto y condiciones comerciales de Casa Solar."}`,
  ];
  doc.text(conditions, 62, y + 26);
  doc.setDrawColor(...red); doc.line(60, 275, 198, 275);
  doc.setTextColor(...red); doc.setFont("helvetica", "bold"); doc.text("ACEPTAMOS TARJETAS DE CRÉDITO, DÉBITO Y TRANSFERENCIA", 62, 283);
  savePdf(doc, `${quote.numero}-${(client.nombre || "cliente").replace(/[^a-z0-9]+/gi, "-")}.pdf`);
}

export function downloadOrderPdf(quote, contact, logo, order = {}) {
  const doc = new jsPDF({ unit: "mm", format: [216, 330] });
  const client = contact || quote.cliente || {};
  const black = [20, 20, 20];
  doc.addImage(logo, "PNG", 12, 10, 52, 9);
  doc.setTextColor(...black); doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.text("O R D E N  D E  P E D I D O", 108, 21, { align: "center" });
  doc.setFontSize(7); doc.text("CORPORACIÓN THERMAL S. A.  |  Plaza Pericentro zona 8, Quetzaltenango  |  PBX 7767 5949", 12, 31);
  doc.setDrawColor(...black); doc.setLineWidth(0.6); doc.line(12, 36, 204, 36);
  const orderNumber = quote.ordenNumero || quote.numero.replace("CS-", "OP-");
  doc.setFontSize(9); doc.text(`N.º ${orderNumber}`, 202, 29, { align: "right" });

  const section = (x, y, w, title) => {
    doc.setFillColor(...black); doc.rect(x, y, w, 7, "F");
    doc.setTextColor(255); doc.setFontSize(8); doc.text(title, x + w / 2, y + 4.7, { align: "center" });
    doc.setTextColor(...black);
  };
  const lineField = (label, value, x, y, w) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.text(label, x, y);
    doc.setFont("helvetica", "normal"); doc.setDrawColor(160); doc.rect(x + 27, y - 4, w - 27, 6);
    if (value) doc.text(doc.splitTextToSize(String(value), w - 30), x + 29, y);
  };

  section(12, 41, 92, "PROGRAMACIÓN");
  lineField("Fecha de pedido", prettyDate(quote.fecha), 15, 53, 86);
  lineField("Asesor de ventas", quote.vendedor, 15, 63, 86);
  lineField("Fecha instalación", order.fechaInstalacion ? prettyDate(order.fechaInstalacion) : "Por confirmar", 15, 73, 86);
  lineField("Horario", order.horario || "Por confirmar", 15, 83, 86);

  section(108, 41, 96, "DATOS DEL CLIENTE");
  lineField("Nombre", client.nombre, 111, 53, 90);
  lineField("Dirección", order.direccion || client.direccion, 111, 63, 90);
  lineField("Departamento", order.departamento || client.departamento, 111, 73, 90);
  lineField("Teléfono", order.telefono || client.telefono, 111, 83, 90);
  lineField("NIT", order.nit || client.nit, 111, 93, 90);

  section(12, 93, 92, "DESCRIPCIÓN DEL PRODUCTO");
  const orderItems = quote.items.slice(0, 16).map(item => [
    itemDescription(item),
    item.cantidad,
    money(item.precioUnitario),
  ]);
  while (orderItems.length < 16) orderItems.push(["", "", ""]);
  autoTable(doc, {
    startY: 100, margin: { left: 12, right: 112 },
    head: [["Producto / servicio", "Cant.", "Precio (Q)"]], body: orderItems,
    theme: "grid", styles: { fontSize: 6, cellPadding: 1.15, minCellHeight: 6 },
    headStyles: { fillColor: [235, 235, 235], textColor: black },
    columnStyles: { 0: { cellWidth: 53 }, 1: { cellWidth: 14, halign: "center" }, 2: { cellWidth: 25, halign: "right" } },
  });
  const tableEnd = doc.lastAutoTable.finalY;
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.text(`TOTAL: ${money(quote.total)}`, 101, tableEnd + 6, { align: "right" });

  section(108, 103, 96, "DATOS DE FACTURACIÓN");
  lineField("Nombre", client.nombre, 111, 115, 90);
  lineField("Dirección", order.direccion || client.direccion, 111, 125, 90);
  lineField("Departamento", order.departamento || client.departamento, 111, 135, 90);
  lineField("Teléfono", order.telefono || client.telefono, 111, 145, 90);
  lineField("NIT", order.nit || client.nit, 111, 155, 90);

  section(108, 164, 96, "DATOS TÉCNICOS");
  const technical = [
    `Niveles de la casa: ${order.niveles || "Sin indicar"}`,
    `Material del techo: ${order.materialTecho || "Sin indicar"}`,
    `Tipo de techo: ${order.tipoTecho || "Sin indicar"}`,
    `Tubería caliente: ${order.tuberiaCaliente || "-"} / Medida: ${order.medidaTuberiaCaliente || "-"}`,
    `Tubería fría: ${order.tuberiaFria || "-"} / Medida: ${order.medidaTuberiaFria || "-"}`,
    `Presión de agua: ${order.presionAgua || "Sin indicar"}`,
    `Otro calentador: ${order.otroCalentador || "No"} / ${order.detalleOtroCalentador || "Sin detalle"}`,
    `Variación de presión: ${order.variacionPresion || "No"} / ${order.detalleVariacionPresion || "Sin detalle"}`,
    `Instalaciones adicionales: ${order.instalacionesAdicionales || "Ninguna"}`,
    `Distancia adicional: ${order.distanciaAdicional || "0"} metros`,
    `Bomba hidroneumática: ${order.bomba || "Sin indicar"}`,
    `Depósito para agua: ${order.deposito || "-"} / Altura: ${order.alturaDeposito || "-"}`,
    `Conecta al depósito: ${order.conectaDeposito || "Sin indicar"}`,
    `Gradas al último nivel: ${order.gradas || "Sin indicar"}`,
    `¿Entra camión a la casa?: ${order.entraCamion || "Sin indicar"}`,
  ];
  doc.setFont("helvetica", "normal"); doc.setFontSize(5.7);
  let technicalY = 173;
  technical.forEach(text => {
    const lines = doc.splitTextToSize(text, 89).slice(0, 2);
    doc.text(lines, 112, technicalY);
    technicalY += Math.max(4.2, lines.length * 3.4);
  });

  section(12, 222, 92, "ABONOS");
  const payments = [[prettyDate(quote.fecha), order.abono ? money(order.abono) : "", order.saldo ? money(order.saldo) : ""], ...Array.from({ length: 5 }, () => ["", "", ""])];
  autoTable(doc, { startY: 229, margin: { left: 12, right: 112 }, head: [["Fecha", "Abono (Q)", "Saldo (Q)"]], body: payments, theme: "grid", styles: { fontSize: 6, minCellHeight: 7 }, headStyles: { fillColor: [235,235,235], textColor: black } });

  section(108, 250, 96, "FORMA DE PAGO");
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  const paymentMethods = ["Tarjeta débito/crédito", "Visa cuotas", "Financiamiento", "Cheque", "Contado", "Transferencia"];
  paymentMethods.forEach((p, i) => doc.text(`${p === order.formaPago ? "[X]" : "[ ]"} ${p}${p === order.formaPago ? `  Abono ${money(order.abono)}  Saldo ${money(order.saldo)}` : ""}`, 112, 262 + i * 8));

  section(12, 286, 92, "PROMOCIÓN / GARANTÍA / OBSERVACIONES");
  doc.setDrawColor(160); doc.rect(12, 293, 92, 23);
  doc.setFontSize(6); doc.setFont("helvetica", "bold"); doc.text("Promoción:", 15, 298);
  doc.setFont("helvetica", "normal"); doc.text(doc.splitTextToSize(order.promocion || "Sin promoción", 68), 34, 298);
  doc.setFont("helvetica", "bold"); doc.text("Garantía:", 15, 304);
  doc.setFont("helvetica", "normal"); doc.text(doc.splitTextToSize(order.garantia || "Según condiciones del producto", 68), 34, 304);
  doc.setFont("helvetica", "bold"); doc.text("Observaciones:", 15, 310);
  doc.setFont("helvetica", "normal"); doc.text(doc.splitTextToSize(order.observaciones || quote.notas || "", 64), 38, 310);
  doc.setFontSize(5.5); doc.text("Los pagos realizados no son reembolsables. Equipo sujeto a disponibilidad. Cambios de instalación pueden generar costos adicionales.", 108, 309, { maxWidth: 94 });
  doc.line(18, 322, 65, 322); doc.line(84, 322, 131, 322); doc.line(150, 322, 198, 322);
  doc.setFontSize(6); doc.text("Firma del cliente", 41, 326, { align: "center" }); doc.text("Firma del asesor", 107, 326, { align: "center" }); doc.text("Firma de Operaciones", 174, 326, { align: "center" });
  savePdf(doc, `${orderNumber}-${(client.nombre || "cliente").replace(/[^a-z0-9]+/gi, "-")}.pdf`);
}
