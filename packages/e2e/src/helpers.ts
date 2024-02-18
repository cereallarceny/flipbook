import fs from 'node:fs/promises';
import path from 'node:path';

export const FLIPBOOK_APP_URL = '/benchmark';

export function generateRandomString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// Tinybench's output type
type TBenchOutput = ({
  'Task Name': string;
  'ops/sec': string;
  'Average Time (ns)': string | number;
  Margin: string;
  Samples: string | number;
} | null)[];

export const saveBenchMark = async (fileName: string, value: TBenchOutput) => {
  try {
    const outDir = path.resolve(__dirname, '..', 'results');

    const jsonData = {
      'Task Name': value[0]?.['Task Name'] || null,
      'ops/sec': value[0]?.['ops/sec'] || null,
      'Average Time (ns)': value[0]?.['Average Time (ns)'] || null,
      Margin: value[0]?.Margin || null,
      Samples: value[0]?.Samples || null,
    };

    console.log(`Saving benchmark to ${outDir}/${fileName}`, jsonData);

    const jsonString = JSON.stringify(jsonData, null, 2);

    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(`${outDir}/${fileName}`, jsonString, 'utf-8');
  } catch (err) {
    console.log('Error saving benchmark:', err);
  }
};
