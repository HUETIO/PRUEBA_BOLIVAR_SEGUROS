import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const mdPath = join(root, 'RESPUESTA_PRUEBA_TECNICA.md');
const outPath = join(here, 'RESPUESTA_PRUEBA_TECNICA_ARCHIFY.html');

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (s) =>
  escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const lines = readFileSync(mdPath, 'utf8').split(/\r?\n/);
const body = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];

  if (/^```/.test(line)) {
    const lang = line.replace(/^``` */, '');
    const buf = [];
    i++;
    while (i < lines.length && !/^```/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    i++;
    body.push(
      `<pre class="code${lang ? ' lang-' + lang : ''}"><code>${escapeHtml(
        buf.join('\n')
      )}</code></pre>`
    );
    continue;
  }

  if (/^\|/.test(line)) {
    const head = [];
    const headSep = [];
    const rows = [];
    while (i < lines.length && /^\|/.test(lines[i])) {
      const cells = lines[i]
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());
      if (/^:?-{3,}:?$/.test(cells.join(''))) {
        headSep.push(cells);
      } else if (headSep.length === 0) {
        head.push(cells);
      } else {
        rows.push(cells);
      }
      i++;
    }
    const th = (c) => `<th>${inline(c)}</th>`;
    const td = (c) => `<td>${inline(c)}</td>`;
    body.push(
      '<table><thead><tr>' + (head[0] || []).map(th).join('') + '</tr></thead><tbody>' +
        rows.map((r) => '<tr>' + r.map(td).join('') + '</tr>').join('') +
        '</tbody></table>'
    );
    continue;
  }

  if (/^(#{1,6})\s+/.test(line)) {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    const lvl = Math.min(m[1].length, 3);
    body.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
    i++;
    continue;
  }

  if (/^(\s*)- /.test(line)) {
    const stack = [];
    while (i < lines.length && /^(\s*)- /.test(lines[i])) {
      const m = lines[i].match(/^(\s*)- (.*)$/);
      const indent = m[1].length;
      const text = m[2];
      while (stack.length && indent <= stack[stack.length - 1].indent) {
        body.push('</ul>');
        stack.pop();
      }
      if (!stack.length || indent > stack[stack.length - 1].indent) {
        stack.push({ indent });
        body.push('<ul>');
      }
      body.push(`<li>${inline(text)}</li>`);
      i++;
    }
    while (stack.length) {
      body.push('</ul>');
      stack.pop();
    }
    continue;
  }

  if (/^>\s?/.test(line)) {
    const buf = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) {
      buf.push(lines[i].replace(/^>\s?/, ''));
      i++;
    }
    body.push('<blockquote>' + buf.map((b) => warm(b)).join('<br>') + '</blockquote>');
    continue;
  }

  if (/^---+\s*$/.test(line)) {
    body.push('<hr>');
    i++;
    continue;
  }

  if (/^\s*$/.test(line)) {
    i++;
    continue;
  }

  const buf = [];
  while (i < lines.length && lines[i].trim() !== '' && !/^(```|\||#|>|---|(-\s))/.test(lines[i])) {
    buf.push(lines[i]);
    i++;
  }
  body.push('<p>' + buf.map(warm).join('<br>') + '</p>');
}

function warm(l) {
  return inline(l);
}

const figures = [
  ['view-all.png', 'Vista general de la arquitectura SegurosPolizas (Archify). 10 componentes y 10 conexiones: frontend React 19, API demo Express en memoria, backend Spring Boot 3 (Controller → Service → Repository → H2) y la integración con la capa media WebLogic CORE.'],
  ['view-ruta-demo.png', 'Vista "Ruta principal (demo)" — el camino operativo completo: Usuarios & Clientes → React SPA → Express API (:3000, API en memoria que replica el contrato Spring) → WebLogic capa media (mock). Cada mutación queda registrada como evento.'],
  ['view-backend-real.png', 'Vista "Backend real Spring Boot" — implementación Java 17 (:8080): Controller Layer (Poliza · Riesgo · CoreMock, filtro ApiKeyAuthFilter) → Service Layer (reglas de negocio) → JPA Repositories → H2 (mem:polizasdb).'],
  ['view-integracion-core.png', 'Vista "WebLogic CORE (Módulo 1)" — cómo funciona la integración: Service llama a CoreIntegrationService (adapter RestTemplate, patrón Hexagonal/Ports & Adapters + Outbox), que notifica a la capa media (mock /core-mock/evento con logs SLF4J) con destino al Oracle WebLogic CORE.'],
  ['view-reglas-negocio.png', 'Vista "Reglas y endpoints (Módulo 2)" — autenticación x-api-key (401 si falta), los 6 endpoints obligatorios y las reglas de negocio con 422: individual = 1 riesgo, no renovar póliza CANCELADA, cancelación en cascada de riesgos.'],
  ['view-bbdd-git.png', 'Vista "BBDD y Git (Módulos 3-4)" — estrategias SQL (índices cubrientes, particionado + vista materializada con refresco concurrente, CTE con filtrado temprano + EXPLAIN ANALYZE) y git cherry-pick del hotfix de main a feature/new-login.']
];

const figuresHtml =
  '<section class="annex">' +
  '<h2>Anexo — Arquitectura del proyecto (capturas de Archify)</h2>' +
  '<p class="intro">A continuación, capturas generadas con <strong>Archify</strong> desde el documento <code>docs/seguros-polizas-architecture.html</code>. Cada vista resalta los componentes involucrados y explica cómo funciona esa parte del sistema.</p>' +
  figures
    .map(
      (f, idx) =>
        `<figure><img src="${f[0]}" alt="${f[1]}"/><figcaption><strong>Figura ${idx + 1}.</strong> ${f[1]}</figcaption></figure>`
    )
    .join('') +
  '</section>';

const html =
  '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Respuesta Prueba Técnica + Anexo Arquitectura Archify</title>' +
  '<style>' +
  '@page { size: A4; margin: 18mm 16mm; }' +
  'body { font-family: "Segoe UI", "Arial", sans-serif; color: #1f2937; font-size: 11pt; line-height: 1.5; margin: 0; }' +
  '.doc-header { border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px; }' +
  '.doc-header h1 { margin: 0; font-size: 18pt; color: #0f172a; }' +
  '.doc-header p { margin: 4px 0 0; color: #475569; font-size: 9.5pt; }' +
  'h1 { font-size: 17pt; color: #0f172a; }' +
  'h2 { font-size: 14pt; color: #0f766e; border-bottom: 1px solid #99f6e4; padding-bottom: 4px; margin-top: 26px; page-break-after: avoid; }' +
  'h3 { font-size: 12pt; color: #0f172a; page-break-after: avoid; }' +
  'h4 { font-size: 11pt; color: #0f172a; page-break-after: avoid; }' +
  'p { margin: 8px 0; }' +
  'ul { margin: 6px 0 6px 0; padding-left: 22px; }' +
  'li { margin: 3px 0; }' +
  'code { font-family: "Cascadia Mono", Consolas, monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; }' +
  'pre.code { background: #0f172a; color: #e2e8f0; padding: 12px 14px; border-radius: 6px; overflow-x: auto; font-size: 8.5pt; line-height: 1.4; page-break-inside: avoid; white-space: pre-wrap; }' +
  'pre.code code { background: none; color: inherit; padding: 0; font-size: 8.5pt; }' +
  'table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt; page-break-inside: auto; }' +
  'th { background: #0f766e; color: #fff; text-align: left; padding: 6px 8px; }' +
  'td { border: 1px solid #cbd5e1; padding: 5px 8px; vertical-align: top; }' +
  'tr:nth-child(even) td { background: #f8fafc; }' +
  'tr { page-break-inside: avoid; }' +
  'blockquote { border-left: 4px solid #0d9488; background: #ecfdf5; margin: 10px 0; padding: 8px 12px; color: #065f46; }' +
  'hr { border: none; border-top: 1px solid #cbd5e1; margin: 18px 0; }' +
  'a { color: #0d9488; text-decoration: none; }' +
  '.annex { margin-top: 30px; }' +
  '.annex .intro { color: #475569; }' +
  'figure { margin: 0 0 22px; page-break-inside: avoid; }' +
  'figure img { width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 1px 4px rgba(15,23,42,.12); }' +
  'figcaption { margin-top: 6px; font-size: 9pt; color: #475569; }' +
  '</style></head><body>' +
  '<div class="doc-header"><h1>Respuesta Prueba Técnica — Seguros Bolívar</h1>' +
  '<p>Documento original: <code>RESPUESTA_PRUEBA_TECNICA.md</code> · Anexo visual generado con Archify</p></div>' +
  '<article>' + body.join('\n') + '</article>' +
  figuresHtml +
  '</body></html>';

writeFileSync(outPath, html, 'utf8');
console.log('HTML escrito:', outPath, '·', Buffer.byteLength(html, 'utf8'), 'bytes');