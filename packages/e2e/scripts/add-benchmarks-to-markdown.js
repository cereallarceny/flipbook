const path = require('path');
const fs = require('fs/promises');

// Generate markdown table from data
function generateMarkdownTable(data) {
  // Extract header row from the first data entry
  const headerRow = Object.keys(data[0]);

  // Generate table header
  const tableHeader = `| ${headerRow.join(' | ')} |\n| ${headerRow
    .map(() => '---')
    .join(' | ')} |`;

  // Generate table rows
  const tableRows = data.map(
    (row) => `| ${headerRow.map((header) => row[header]).join(' | ')} |`
  );

  // Combine header and rows
  return `${tableHeader}\n${tableRows.join('\n')}`;
}

// IIFE (Immediately Invoked Function Expression)
(async () => {
  try {
    // structure data object
    const data = {
      'writer-100': {},
      'writer-1k': {},
      'writer-10k': {},
      'reader-100': {},
      'reader-1k': {},
      'reader-10k': {},
    };

    // output directory
    const outDir = path.resolve(__dirname, '..', 'results');

    // docs directory
    const docsDir = path.resolve(__dirname, '..');

    // read files
    const writerHundred = await fs.readFile(
      `${outDir}/writer-bench-hundred.json`,
      'utf-8'
    );
    const writerThousand = await fs.readFile(
      `${outDir}/writer-bench-1k.json`,
      'utf-8'
    );
    const writerTenThousand = await fs.readFile(
      `${outDir}/writer-bench-10k.json`,
      'utf-8'
    );
    const readerHundred = await fs.readFile(
      `${outDir}/reader-bench-hundred.json`,
      'utf-8'
    );
    const readerThousand = await fs.readFile(
      `${outDir}/reader-bench-1k.json`,
      'utf-8'
    );
    const readerTenThousand = await fs.readFile(
      `${outDir}/reader-bench-10k.json`,
      'utf-8'
    );

    // store data in data object
    data['writer-100'] = JSON.parse(writerHundred);
    data['writer-1k'] = JSON.parse(writerThousand);
    data['writer-10k'] = JSON.parse(writerTenThousand);
    data['reader-100'] = JSON.parse(readerHundred);
    data['reader-1k'] = JSON.parse(readerThousand);
    data['reader-10k'] = JSON.parse(readerTenThousand);

    // generate markdown tables
    const writerHundredTable = generateMarkdownTable([data['writer-100']]);
    const writerThousandTable = generateMarkdownTable([data['writer-1k']]);
    const writerTenThousandTable = generateMarkdownTable([data['writer-10k']]);
    const readerHundredTable = generateMarkdownTable([data['reader-100']]);
    const readerThousandTable = generateMarkdownTable([data['reader-1k']]);
    const readerTenThousandTable = generateMarkdownTable([data['reader-10k']]);

    // create markdown
    const markdown = `## Benchmarks

### Writer

#### For 100 char string

${writerHundredTable}

#### For 1,000 char string

${writerThousandTable}

#### For 10,000 char string

${writerTenThousandTable}

### Reader

#### For 100 char string

${readerHundredTable}

#### For 1,000 char string

${readerThousandTable}

#### For 10,000 char string

${readerTenThousandTable}`;

    // save markdown
    await fs.writeFile(`${docsDir}/README.md`, markdown, 'utf-8');
  } catch (err) {
    console.log('Error saving benchmark:', err);
  }
})();
