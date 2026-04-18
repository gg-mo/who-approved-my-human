import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function normalizeValue(rawValue) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return '';
  }

  const quote = trimmed[0];
  const hasMatchingQuote = quote === '"' || quote === "'";

  if (hasMatchingQuote && trimmed.endsWith(quote)) {
    const inner = trimmed.slice(1, -1);

    if (quote === '"') {
      return inner
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"');
    }

    return inner;
  }

  return trimmed;
}

function parseLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const withoutExport = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
  const match = withoutExport.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

  if (!match) {
    return null;
  }

  const [, key, rawValue] = match;
  return { key, value: normalizeValue(rawValue) };
}

function loadDotEnvFile(path) {
  if (!existsSync(path)) {
    return false;
  }

  const content = readFileSync(path, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const parsed = parseLine(line);

    if (!parsed) {
      continue;
    }

    if (process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value;
    }
  }

  return true;
}

export function loadScriptEnv(cwd = process.cwd()) {
  const candidates = ['.env.local', '.env'];
  const loadedFiles = [];

  for (const file of candidates) {
    const filePath = resolve(cwd, file);
    if (loadDotEnvFile(filePath)) {
      loadedFiles.push(file);
    }
  }

  return loadedFiles;
}
