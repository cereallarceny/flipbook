import fs from 'node:fs/promises';
import path from 'node:path';

export const FLIPBOOK_APP_URL = '/benchmark';

export const resultsDir = path.resolve(__dirname, '..', 'results');
export const assetsDir = path.resolve(resultsDir, 'assets');

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

export const saveBenchMark = async (
  fileName: string,
  value: (Record<string, string | number> | null)[]
) => {
  try {
    const jsonData = {
      'Task Name': value[0]?.['Task Name'] || null,
      'ops/sec': value[0]?.['ops/sec'] || null,
      'Average Time (ns)': value[0]?.['Average Time (ns)'] || null,
      Margin: value[0]?.Margin || null,
      Samples: value[0]?.Samples || null,
    };

    console.log(`Saving benchmark to ${resultsDir}/${fileName}`, jsonData);

    const jsonString = JSON.stringify(jsonData, null, 2);

    await fs.mkdir(resultsDir, { recursive: true });
    await fs.writeFile(`${resultsDir}/${fileName}`, jsonString, 'utf-8');

    console.log('Benchmark saved');
  } catch (err) {
    console.log('Error saving benchmark:', err);
  }
};
