import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_URL =
  'https://raw.githubusercontent.com/LaQuay/TDTChannels/master/RADIO.md';

const OUTPUT_PATH = path.join(
  __dirname,
  '../src/assets/radios/radios.json'
);

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(`No se pudo descargar el markdown. Status: ${res.statusCode}`)
          );
          return;
        }

        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function splitMarkdownRow(row) {
  return row
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function extractLinks(text) {
  const regex = /\[([^[\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  const links = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    links.push({
      label: match[1].trim(),
      url: match[2].trim(),
    });
  }

  return links;
}

function normalizeStreamType(label, url) {
  const labelLower = label.toLowerCase();
  const urlLower = url.toLowerCase();

  if (labelLower.includes('aac') || urlLower.includes('.aac')) return 'aac';
  if (labelLower.includes('mp3') || urlLower.includes('.mp3')) return 'mp3';
  if (labelLower.includes('m3u8') || urlLower.includes('.m3u8')) return 'm3u8';

  return 'stream';
}

function normalizeCategory(category) {
  const clean = category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (clean === 'musicales') return 'Musicales';
  if (clean === 'nacionales') return 'Nacionales';
  if (clean === 'autonomicas') return 'Autonómicas';
  if (clean === 'deportivas') return 'Deportivas';
  if (clean === 'infantiles') return 'Infantiles';

  return category.trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanValue(value) {
  const trimmed = value.trim();
  return trimmed === '-' ? '' : trimmed;
}

function parseMarkdownToRadios(markdown) {
  const lines = markdown.split('\n');

  const radios = [];
  let currentCategory = '';
  let currentRegion = '';
  let id = 1;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    if (line.startsWith('## ')) {
      currentCategory = normalizeCategory(line.replace('## ', '').trim());
      currentRegion = '';
      continue;
    }

    if (line.startsWith('### ')) {
      currentRegion = line.replace('### ', '').trim();
      continue;
    }

    if (
      !line.startsWith('|') ||
      line.startsWith('| Emisoras |') ||
      line.startsWith('| - |')
    ) {
      continue;
    }

    const columns = splitMarkdownRow(line);

    if (columns.length < 5) continue;

    const [nameCell, streamCell, , logoCell, epgIdCell] = columns;

    const name = cleanValue(nameCell);
    if (!name || name === 'Emisoras') continue;

    const streams = extractLinks(streamCell).map((link) => ({
      label: link.label,
      type: normalizeStreamType(link.label, link.url),
      url: link.url,
    }));

    const logo = extractLinks(logoCell)[0]?.url || '';
    const epgId = cleanValue(epgIdCell);
    const region = currentCategory === 'Autonómicas' ? currentRegion : '';

    const slug = slugify(
      `${currentCategory}-${region ? `${region}-` : ''}${name}`
    );

    radios.push({
      id: id++,
      name,
      category: currentCategory || 'General',
      region,
      logo,
      epgId,
      slug,
      streams,
    });
  }

  return radios;
}

function addFavoriteKeys(radios) {
  const epgIdCount = new Map();

  for (const radio of radios) {
    if (!radio.epgId) continue;
    epgIdCount.set(radio.epgId, (epgIdCount.get(radio.epgId) || 0) + 1);
  }

  return radios.map((radio) => {
    let favoriteKey = '';

    if (radio.epgId && epgIdCount.get(radio.epgId) === 1) {
      favoriteKey = radio.epgId;
    } else if (radio.epgId) {
      favoriteKey = `${radio.epgId}__${radio.slug}`;
    } else {
      favoriteKey = radio.slug;
    }

    return {
      ...radio,
      favoriteKey,
    };
  });
}

async function main() {
  try {
    console.log('Descargando RADIO.md...');
    const markdown = await fetchText(RAW_URL);

    console.log('Generando JSON...');
    const radios = parseMarkdownToRadios(markdown);
    const radiosWithFavoriteKey = addFavoriteKeys(radios);

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(radiosWithFavoriteKey, null, 2),
      'utf8'
    );

    console.log(
      `✅ radios.json generado con ${radiosWithFavoriteKey.length} emisoras`
    );
    console.log(`📁 ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();