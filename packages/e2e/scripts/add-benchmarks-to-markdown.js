const path = require('path');
const fs = require('fs/promises');
const markdownInclude = require('markdown-include');

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
      100: {},
      '1k': {},
      '10k': {},
      '100k': {},
    };

    // output directory
    const outDir = path.resolve(__dirname, '..', 'build');

    // docs directory
    const docsDir = path.resolve(__dirname, '..', 'docs');

    // read files
    const hundred = await fs.readFile(`${outDir}/bench-hundred.json`, 'utf-8');
    const thousand = await fs.readFile(`${outDir}/bench-1k.json`, 'utf-8');
    const tenThousand = await fs.readFile(`${outDir}/bench-10k.json`, 'utf-8');
    const hundredThousand = await fs.readFile(
      `${outDir}/bench-100k.json`,
      'utf-8'
    );

    // store data in data object
    data[100] = JSON.parse(hundred);
    data['1k'] = JSON.parse(thousand);
    data['10k'] = JSON.parse(tenThousand);
    data['100k'] = JSON.parse(hundredThousand);

    // generate markdown tables
    const hundredTable = generateMarkdownTable([data[100]]);
    const thousandTable = generateMarkdownTable([data['1k']]);
    const tenThousandTable = generateMarkdownTable([data['10k']]);
    const hundredThousandTable = generateMarkdownTable([data['100k']]);

    // create markdown
    const markdown = `\n## Benchmarks\n\n### For 100 char string\n\n${hundredTable}\n\n### For 1,000 char string\n\n${thousandTable}\n\n### For 10,000 char string\n\n${tenThousandTable}\n\n### For 100,000 char string\n\n${hundredThousandTable}`;

    // save markdown
    await fs.writeFile(`${docsDir}/benchmarks.md`, markdown, 'utf-8');
  } catch (err) {
    console.log('Error saving benchmark:', err);
  }
})();
