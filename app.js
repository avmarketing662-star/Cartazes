"use strict";

const W = 2480, H = 3508;
const $ = id => document.getElementById(id);

let backgroundUrl = null;
let products = [];
let zoom = .35;
let selected = "name";

const fields = {
  name:  { x: 50, y: 48, text: "Nome do produto", size: 110, color: "#111111", weight: "700", align: "center", family: "Arial, sans-serif" },
  price: { x: 50, y: 66, text: "R$ 00,00", size: 190, color: "#d71920", weight: "900", align: "center", family: "Arial, sans-serif" },
  type:  { x: 50, y: 82, text: "UNIDADE", size: 85, color: "#111111", weight: "700", align: "center", family: "Arial, sans-serif" },
  date:  { x: 50, y: 90, text: "DATA", size: 70, color: "#111111", weight: "700", align: "center", family: "Arial, sans-serif" }
};

const fieldIds = {
  name: "previewName",
  price: "previewPrice",
  type: "previewType",
  date: "previewDate"
};

const fieldLabels = {
  name: "Nome",
  price: "Valor",
  type: "Tipo / quantidade",
  date: "Data"
};

// Os IDs originais de estilo foram mantidos para o campo Nome.
const controlIds = {
  name:  { size: "fontSize", color: "fontColor", family: "fontFamily", weight: "weightName", align: "alignName", text: "nameText" },
  price: { size: "sizePrice", color: "colorPrice", family: "familyPrice", weight: "weightPrice", align: "alignPrice", text: "priceText" },
  type:  { size: "sizeType", color: "colorType", family: "familyType", weight: "weightType", align: "alignType", text: "typeText" },
  date:  { size: "sizeDate", color: "colorDate", family: "familyDate", weight: "weightDate", align: "alignDate", text: "dateText" }
};

function setZoom() {
  const poster = $("poster");
  poster.style.width = (W * zoom) + "px";
  poster.style.height = (H * zoom) + "px";
  $("zoomLabel").textContent = Math.round(zoom * 100) + "%";
}

function syncControls(key) {
  const f = fields[key], ids = controlIds[key];
  $(ids.size).value = f.size;
  $(ids.color).value = f.color;
  $(ids.family).value = f.family;
  $(ids.weight).value = f.weight;
  $(ids.align).value = f.align;
  $(ids.text).value = f.text;
}

function renderField(key) {
  const f = fields[key], el = $(fieldIds[key]);
  el.style.left = f.x + "%";
  el.style.top = f.y + "%";
  el.style.fontSize = (f.size * zoom) + "px";
  el.style.color = f.color;
  el.style.fontWeight = f.weight;
  el.style.fontFamily = f.family;
  el.style.textAlign = f.align;
  el.textContent = f.text;

  // O nome pode ocupar várias linhas sem ultrapassar a largura do cartaz.
  if (key === "name") {
    el.style.width = "90%";
    el.style.maxWidth = "90%";
    el.style.boxSizing = "border-box";
    el.style.whiteSpace = "normal";
    el.style.overflowWrap = "break-word";
    el.style.wordBreak = "normal";
    el.style.lineHeight = "1.05";
  }

  el.classList.toggle("selected", selected === key);
}

function renderAll() {
  Object.keys(fields).forEach(renderField);
  $("selectedField").textContent = "Campo selecionado: " + fieldLabels[selected];
}

function selectField(key) {
  selected = key;
  renderAll();
}

function applyControlsToField(key) {
  const f = fields[key], ids = controlIds[key];
  f.size = Math.max(10, Math.min(500, Number($(ids.size).value) || f.size));
  f.color = $(ids.color).value;
  f.family = $(ids.family).value;
  f.weight = $(ids.weight).value;
  f.align = $(ids.align).value;
  f.text = $(ids.text).value;
  renderField(key);
}

$("backgroundInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  if (backgroundUrl) URL.revokeObjectURL(backgroundUrl);
  backgroundUrl = URL.createObjectURL(file);
  $("poster").style.backgroundImage = `url("${backgroundUrl}")`;
  $("emptyState").style.display = "none";

  const img = new Image();
  img.onload = () => {
    $("imageInfo").textContent = `Imagem: ${img.naturalWidth} × ${img.naturalHeight} px`;
  };
  img.src = backgroundUrl;

  const ready = products.length > 0;
  $("generateBtn").disabled = !ready;
  $("printBtn").disabled = !ready;
});

Object.entries(fieldIds).forEach(([key, id]) => {
  $(id).addEventListener("pointerdown", e => {
    selectField(key);
    e.preventDefault();

    const poster = $("poster");
    const rect = poster.getBoundingClientRect();

    const move = ev => {
      const x = Math.max(0, Math.min(100, (ev.clientX - rect.left) / rect.width * 100));
      const y = Math.max(0, Math.min(100, (ev.clientY - rect.top) / rect.height * 100));
      fields[key].x = x;
      fields[key].y = y;
      renderField(key);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
});

// Texto e estilo são atualizados campo a campo, sem controles compartilhados.
Object.entries(controlIds).forEach(([key, ids]) => {
  $(ids.text).addEventListener("input", e => {
    fields[key].text = e.target.value;
    renderField(key);
  });

  ["size", "color", "family", "weight", "align"].forEach(prop => {
    $(ids[prop]).addEventListener("input", () => {
      applyControlsToField(key);
    });
    // change cobre selects em navegadores que não disparam input consistentemente.
    $(ids[prop]).addEventListener("change", () => {
      applyControlsToField(key);
    });
  });
});

$("applyStyleBtn").addEventListener("click", () => {
  // Mantém o comando original: confirma/reaplica os controles do campo selecionado.
  applyControlsToField(selected);
});

$("resetPositionsBtn").addEventListener("click", () => {
  fields.name.x = 50; fields.name.y = 48;
  fields.price.x = 50; fields.price.y = 66;
  fields.type.x = 50; fields.type.y = 82;
  fields.date.x = 50; fields.date.y = 90;
  renderAll();
});

$("zoomIn").onclick = () => {
  zoom = Math.min(.7, zoom + .05);
  setZoom();
  renderAll();
};
$("zoomOut").onclick = () => {
  zoom = Math.max(.15, zoom - .05);
  setZoom();
  renderAll();
};

function normalizeHeader(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function parseCSV(text) {
  const first = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const firstLine = first.split(/\r?\n/)[0];
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [], cell = "", quoted = false;

  for (let i = 0; i < first.length; i++) {
    const c = first[i];
    if (c === '"' && quoted && first[i + 1] === '"') {
      cell += '"'; i++;
    } else if (c === '"') {
      quoted = !quoted;
    } else if (c === delimiter && !quoted) {
      row.push(cell.trim()); cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && first[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some(v => v !== "")) rows.push(row);
      row = []; cell = "";
    } else {
      cell += c;
    }
  }

  row.push(cell.trim());
  if (row.some(v => v !== "")) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows.shift().map(normalizeHeader);
  const find = names => headers.findIndex(h => names.includes(h));
  const ni = find(["nome", "produto", "nomedoproduto"]);
  const pi = find(["valor", "preco", "precounitario", "precooferta"]);
  const ti = find(["tipoquantidade", "tipo", "quantidade", "unidade"]);
  const di = find(["data", "validade", "datavalidade"]);

  if (ni < 0 || pi < 0) {
    throw new Error("O CSV precisa ter pelo menos as colunas nome e valor.");
  }

  return rows.map(r => ({
    nome: r[ni] || "",
    valor: r[pi] || "",
    tipo: ti >= 0 ? (r[ti] || "") : "",
    data: di >= 0 ? (r[di] || "") : ""
  })).filter(p => p.nome || p.valor || p.tipo || p.data);
}

$("csvInput").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    products = parseCSV(await file.text());
    $("csvInfo").textContent = `${products.length} produto(s) importado(s) de ${file.name}.`;
    $("productCount").textContent = products.length;
    $("generateBtn").disabled = !products.length || !backgroundUrl;
    $("printBtn").disabled = !products.length || !backgroundUrl;
  } catch (err) {
    $("csvInfo").textContent = err.message;
    products = [];
    $("productCount").textContent = "0";
    $("generateBtn").disabled = true;
    $("printBtn").disabled = true;
  }
});

$("demoBtn").onclick = () => {
  products = [
    { nome: "ARROZ TIPO 1 5KG", valor: "R$ 24,99", tipo: "PACOTE", data: "" },
    { nome: "LEITE INTEGRAL 1L", valor: "R$ 4,69", tipo: "UNIDADE", data: "" },
    { nome: "BANANA NANICA KG", valor: "R$ 3,99", tipo: "KG", data: "" }
  ];
  $("csvInfo").textContent = "Exemplo carregado. Importe sua imagem para gerar.";
  $("productCount").textContent = products.length;
  $("generateBtn").disabled = !backgroundUrl;
  $("printBtn").disabled = !backgroundUrl;
};

function buildPages() {
  if (!backgroundUrl || !products.length) return;

  const area = $("printArea");
  area.innerHTML = "";
  const bg = backgroundUrl;

  for (const p of products) {
    const page = document.createElement("div");
    page.className = "print-page";
    page.style.position = "relative";
    page.style.overflow = "hidden";

    // Imagem como elemento real (em vez de background-image), para que
    // também seja impressa quando o navegador não imprime fundos CSS.
    const background = document.createElement("img");
    background.className = "print-background";
    background.src = bg;
    background.alt = "";
    background.setAttribute("aria-hidden", "true");
    background.style.position = "absolute";
    background.style.inset = "0";
    background.style.width = "100%";
    background.style.height = "100%";
    background.style.objectFit = "fill";
    background.style.zIndex = "0";
    background.style.display = "block";
    page.appendChild(background);

    for (const [key, value] of [
      ["name", p.nome],
      ["price", p.valor],
      ["type", p.tipo],
      ["date", p.data]
    ]) {
      const f = fields[key];
      const el = document.createElement("div");
      el.className = "print-field";
      el.textContent = value || "";
      el.style.position = "absolute";
      el.style.left = f.x + "%";
      el.style.top = f.y + "%";
      el.style.width = "90%";
      el.style.boxSizing = "border-box";
      el.style.fontSize = (f.size / 2480 * 210) + "mm";
      el.style.color = f.color;
      el.style.fontWeight = f.weight;
      el.style.fontFamily = f.family;
      el.style.textAlign = f.align;
      el.style.zIndex = "1";

      if (key === "name") {
        el.style.maxWidth = "90%";
        el.style.whiteSpace = "normal";
        el.style.overflowWrap = "break-word";
        el.style.wordBreak = "normal";
        el.style.lineHeight = "1.05";
        el.style.height = "auto";
      }

      page.appendChild(el);
    }

    area.appendChild(page);
  }

  $("generationInfo").textContent = `${products.length} página(s) pronta(s) para impressão.`;
  $("printBtn").disabled = false;
}

$("generateBtn").onclick = () => {
  buildPages();
  $("printBtn").disabled = false;
};

$("printBtn").onclick = async () => {
  if (!$("printArea").children.length) buildPages();

  // Aguarda o carregamento das imagens de fundo antes de abrir a impressão.
  const images = Array.from($("printArea").querySelectorAll("img"));
  await Promise.all(images.map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    if (typeof img.decode === "function") return img.decode().catch(() => {});
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));

  window.print();
};

setZoom();
renderAll();
