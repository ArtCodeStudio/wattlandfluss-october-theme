#!/usr/bin/env node
/**
 * migrate-event-images.js
 *
 * Lädt alle Event-Bilder aus dem Firebase-Storage-Bucket des Projekts
 * `jumplink-events` herunter und legt sie lokal im Winter-CMS Media-Ordner ab,
 * sodass sie direkt über das CMS ausgeliefert werden (kein Google mehr nötig).
 *
 * Quelle der Bildliste:  Firestore  customerDomains/<domain>/events/*  -> images[]
 * Quelle der Bilddaten:  image.downloadURL (Firebase Storage, Token enthalten)
 * Ziel:                  storage/app/media/<MEDIA_SUBFOLDER>/<dateiname>
 *
 * Das Skript ist idempotent: bereits vorhandene Dateien werden übersprungen,
 * es kann also gefahrlos mehrfach / stückweise ausgeführt werden.
 *
 * Aufruf (aus dem Theme-Ordner oder beliebig):
 *   node tools/migrate-event-images.js                # herunterladen
 *   node tools/migrate-event-images.js --dry-run      # nur anzeigen, nichts schreiben
 *   node tools/migrate-event-images.js --force        # auch vorhandene neu laden
 *
 * Benötigt Node >= 18 (nutzt globales fetch). Keine externen Abhängigkeiten.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Konfiguration (entspricht assets/javascript/firebase.js)
// ---------------------------------------------------------------------------
const CONFIG = {
  projectId: 'jumplink-events',
  apiKey: 'AIzaSyDrLQEPT31BcsK0L-yFFuAJmolAJZ3E7ac',
  customerDomain: 'watt-land-fluss.de',
};

// Zielordner: <repo>/storage/app/media/<MEDIA_SUBFOLDER>
// tools/ -> theme/ -> themes/ -> <winter-root>  (drei Ebenen hoch)
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const MEDIA_SUBFOLDER = 'events/images'; // spiegelt den Firebase-Storage-Pfad
const TARGET_DIR = path.join(REPO_ROOT, 'storage', 'app', 'media', MEDIA_SUBFOLDER);

// Optional: Dateien dem Webserver-User übergeben, wenn als root ausgeführt.
const WEB_OWNER = { user: 'www-data' };

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');

// ---------------------------------------------------------------------------
// Helfer
// ---------------------------------------------------------------------------
function log(...a) { console.log(...a); }

/** Liest alle Event-Dokumente per Firestore-REST-API (paginiert). */
async function fetchAllEvents() {
  const base = `https://firestore.googleapis.com/v1/projects/${CONFIG.projectId}` +
    `/databases/(default)/documents/customerDomains/${CONFIG.customerDomain}/events`;
  const docs = [];
  let pageToken = '';
  do {
    const url = `${base}?key=${CONFIG.apiKey}&pageSize=300` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Firestore-Abfrage fehlgeschlagen: HTTP ${res.status} ${await res.text()}`);
    }
    const json = await res.json();
    if (Array.isArray(json.documents)) docs.push(...json.documents);
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs;
}

/** Holt den Objektpfad ( watt-land-fluss.de/events/images/<name> ) aus einer downloadURL. */
function objectPathFromDownloadUrl(downloadURL) {
  const m = String(downloadURL).match(/\/o\/([^?]+)/);
  if (!m) return null;
  return decodeURIComponent(m[1]);
}

/** Liest die images[] aller Events flach aus und entfernt Duplikate per Dateiname. */
function collectImages(docs) {
  const byName = new Map();
  for (const doc of docs) {
    const imagesField = doc.fields && doc.fields.images && doc.fields.images.arrayValue;
    const values = (imagesField && imagesField.values) || [];
    for (const v of values) {
      const f = v.mapValue && v.mapValue.fields;
      if (!f) continue;
      const downloadURL = f.downloadURL && f.downloadURL.stringValue;
      if (!downloadURL) continue;
      const objectPath = objectPathFromDownloadUrl(downloadURL);
      if (!objectPath) continue;
      const name = objectPath.substring(objectPath.lastIndexOf('/') + 1);
      const size = f.metadata && f.metadata.mapValue && f.metadata.mapValue.fields
        && f.metadata.mapValue.fields.size && Number(f.metadata.mapValue.fields.size.integerValue || 0);
      // Bei identischem Dateinamen handelt es sich um dasselbe Storage-Objekt.
      if (!byName.has(name)) byName.set(name, { name, downloadURL, size: size || 0 });
    }
  }
  return [...byName.values()];
}

async function download(image) {
  const dest = path.join(TARGET_DIR, image.name);

  if (!FORCE && fs.existsSync(dest)) {
    const stat = fs.statSync(dest);
    if (stat.size > 0) return { status: 'skipped', name: image.name, bytes: stat.size };
  }

  const res = await fetch(image.downloadURL);
  if (!res.ok) {
    return { status: 'failed', name: image.name, error: `HTTP ${res.status}` };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) return { status: 'failed', name: image.name, error: 'leere Antwort' };

  if (DRY_RUN) return { status: 'would-download', name: image.name, bytes: buf.length };

  fs.writeFileSync(dest, buf);
  chownWeb(dest);
  return { status: 'downloaded', name: image.name, bytes: buf.length };
}

/** Übergibt eine Datei dem Webserver-User, falls als root ausgeführt. */
function chownWeb(file) {
  try {
    if (process.getuid && process.getuid() === 0) {
      const os = require('os');
      // uid/gid von www-data ermitteln
      const { execSync } = require('child_process');
      const uid = Number(execSync(`id -u ${WEB_OWNER.user}`).toString().trim());
      const gid = Number(execSync(`id -g ${WEB_OWNER.user}`).toString().trim());
      fs.chownSync(file, uid, gid);
    }
  } catch (e) { /* best effort */ }
}

// ---------------------------------------------------------------------------
// Hauptablauf
// ---------------------------------------------------------------------------
(async function main() {
  log(`\n  Firebase -> lokaler CMS-Media-Ordner`);
  log(`  Zielordner: ${TARGET_DIR}`);
  log(`  Modus:      ${DRY_RUN ? 'DRY-RUN (nichts wird geschrieben)' : (FORCE ? 'FORCE (überschreibt vorhandene)' : 'normal (überspringt vorhandene)')}\n`);

  if (!DRY_RUN) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    chownWeb(path.join(REPO_ROOT, 'storage', 'app', 'media', 'events'));
    chownWeb(TARGET_DIR);
  }

  log('  Lade Event-Liste aus Firestore ...');
  const docs = await fetchAllEvents();
  const images = collectImages(docs);
  log(`  ${docs.length} Events, ${images.length} eindeutige Bilder gefunden.\n`);

  const summary = { downloaded: 0, skipped: 0, failed: 0, 'would-download': 0, bytes: 0 };
  const failures = [];

  // sequenziell, um den Server / die API nicht zu überlasten
  for (const image of images) {
    try {
      const r = await download(image);
      summary[r.status] = (summary[r.status] || 0) + 1;
      if (r.bytes) summary.bytes += r.bytes;
      const tag = { downloaded: 'OK  ', skipped: 'skip', failed: 'FAIL', 'would-download': 'dry ' }[r.status];
      log(`  [${tag}] ${image.name}${r.error ? '  -> ' + r.error : (r.bytes ? '  (' + (r.bytes / 1024).toFixed(0) + ' KB)' : '')}`);
      if (r.status === 'failed') failures.push(r);
    } catch (e) {
      summary.failed++;
      failures.push({ name: image.name, error: e.message });
      log(`  [FAIL] ${image.name}  -> ${e.message}`);
    }
  }

  log(`\n  Fertig.`);
  log(`    heruntergeladen : ${summary.downloaded}`);
  log(`    übersprungen    : ${summary.skipped}`);
  if (summary['would-download']) log(`    würde laden     : ${summary['would-download']}`);
  log(`    fehlgeschlagen  : ${summary.failed}`);
  log(`    Volumen         : ${(summary.bytes / 1024 / 1024).toFixed(1)} MB`);
  if (failures.length) {
    log(`\n  Fehlgeschlagene Dateien:`);
    failures.forEach(f => log(`    - ${f.name}: ${f.error}`));
    process.exitCode = 1;
  }
})().catch(err => {
  console.error('\n  Abbruch:', err.message);
  process.exit(1);
});
