import { EOL } from 'node:os';
import { parseEnv } from 'node:util';

import { readFile, writeFile } from 'fs/promises';

import { isFile } from '../file-util.js';

export async function writeVariableToDotEnv(
  envVariable: string,
  value: string,
  envPath: string
): Promise<void> {
  let rawEnvContent = '';
  if (await isFile(envPath)) {
    rawEnvContent = await readFile(envPath, 'utf-8');
  }

  const newRawContent = upsertToRawEnvContent(envVariable, value, rawEnvContent);

  await writeFile(envPath, newRawContent);
}

export async function deleteVariableFromDotEnv(
  envVariable: string,
  envPath: string
): Promise<void> {
  let rawEnvContent = '';
  if (await isFile(envPath)) {
    rawEnvContent = await readFile(envPath, 'utf-8');
  }

  const newRawContent = deleteFromRawEnvContent(envVariable, rawEnvContent);

  await writeFile(envPath, newRawContent);
}

export function upsertToRawEnvContent(
  envVariable: string,
  value: string,
  rawEnvContent: string
): string {
  const envContent = {
    ...parseEnv(rawEnvContent),
    [envVariable]: value, // Overwrite or add the variable
  };
  return (
    Object.entries(envContent)
      .map(([k, v]) => `${k}=${v}`)
      .join(EOL) + EOL
  );
}

export function deleteFromRawEnvContent(envVariable: string, rawEnvContent: string): string {
  const envContent = parseEnv(rawEnvContent);
  const newRawEnvContent = Object.entries(envContent)
    .map(([k, v]) => (k !== envVariable ? `${k}=${v}` : ``))
    .join(EOL);

  if (newRawEnvContent === '') {
    return ''; // Don't add a new line if the content is empty
  }
  return newRawEnvContent + EOL;
}
