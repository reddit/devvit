// Requires:
// - Node.js installed
// - Git installed
// - An existing git repository

const fs = require('fs');
const path = require('path');

// Replace with your repository details and file paths
const schemaPath = '../../../dw-airflow/dags/bulk_export/core_snapshot/schema_configs'; // e.g., './my-repo'
const markdownFilePath = '../snapshot/schemas.md';
const fieldsHeading = '## Fields';

const entities = [
  'accounts',
  'subreddits',
  'posts',
  'comments',
  'records_to_remove',
  'records_to_redact',
];

// Main function to write snapshot schemas
async function writeSnapshotSchemas() {
  try {
    writeFormatAndSchemasPage();
    console.log(`Schemas written to ${markdownFilePath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Write format and schemas page logic
function writeFormatAndSchemasPage() {
  // Get new schema content
  const newContent = writeSchemasMarkdown();

  // Read the current file
  fs.readFile(markdownFilePath, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error('Error reading the file:', readErr);
      return;
    }

    // Get the index where schemas start
    const fieldsIndex = data.indexOf(fieldsHeading);
    if (fieldsIndex === -1) {
      console.error('The word "Fields" was not found in the file.');
      return;
    }

    // Extract everything before "Schemas" and append newline and new content
    const updatedContent = data.slice(0, fieldsIndex + fieldsHeading.length) + '\n' + newContent;

    // Write the updated content back to the file
    fs.writeFile(markdownFilePath, updatedContent, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing to the file:', writeErr);
      } else {
        console.log('File successfully updated!');
      }
    });
  });
}

// Generates schema markdown for all entities
function writeSchemasMarkdown() {
  let schemaString = '';

  for (const entity of entities) {
    schemaString += `\n### ${capitalizeFirstLetter(entity)}\n\n`;
    const markdownTable = writeSnapshotSchemaForEntity(entity);
    schemaString += `${markdownTable}`;
  }

  return schemaString;
}

// Reads and generates a markdown table for a single entity
function writeSnapshotSchemaForEntity(entity) {
  try {
    const jsonFilePath = path.join(schemaPath, `${entity}_schema.json`);
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    return createMarkdownTable(jsonData);
  } catch (error) {
    console.error(`Error processing schema for entity "${entity}":`, error);
    return `Error processing schema for "${entity}".\n`;
  }
}

// Creates markdown tables based on entity data
function createMarkdownTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data to display.\n';
  }

  // Table headers
  const headers = ['Name', 'Type', 'Description', 'Example(s)'];
  const rows = data.map((item) => [
    item.name || '',
    transformType(item) || '',
    item.description || '',
    (item.examples || []).map((example) => `\`${example}\``).join('<br><br>') || '',
  ]);

  // Get maximum width of each column
  const colWidths = headers.map((header, index) => {
    return Math.max(
      header.length, // Header length
      ...rows.map((row) => row[index].length) // Content length
    );
  });

  // Generate Markdown table
  const formatRow = (row) => row.map((col, index) => col.padEnd(colWidths[index])).join(' | ');

  const headerRow = formatRow(headers);
  const separatorRow = colWidths.map((width) => '-'.repeat(width)).join(' | ');

  let markdown = `| ${headerRow} |\n`;
  markdown += `| ${separatorRow} |\n`;
  rows.forEach((row) => {
    markdown += `| ${formatRow(row)} |\n`;
  });

  return markdown;
}

// Transforms types into human-readable formats
function transformType(item) {
  const originalType = item.type;
  if (item.name === 'gallery_images') {
    return 'array of strings';
  }
  switch (originalType) {
    case 'STRING':
      return 'string';
    case 'INTEGER':
      return '32-bit integer';
    case 'FLOAT':
      return 'decimal';
    case 'BOOLEAN':
      return 'boolean';
    case 'DATETIME':
      return 'ISO 8601 timestamp';
    default:
      return originalType;
  }
}

// Capitalizes the first letter of a word
function capitalizeFirstLetter(word) {
  if (!word || typeof word !== 'string') return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Execute the script
writeSnapshotSchemas();
