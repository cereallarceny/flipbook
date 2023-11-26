export interface FileType {
  label: string;
  value: string;
}

// A list of file types for use by the Monaco editor
export const fileTypes: FileType[] = [
  {
    label: 'Plain Text',
    value: 'plaintext',
  },
  {
    label: 'JavaScript',
    value: 'javascript',
  },
  {
    label: 'TypeScript',
    value: 'typescript',
  },
  {
    label: 'HTML',
    value: 'html',
  },
  {
    label: 'CSS',
    value: 'css',
  },
  {
    label: 'JSON',
    value: 'json',
  },
  {
    label: 'Markdown',
    value: 'markdown',
  },
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Ruby',
    value: 'ruby',
  },
  {
    label: 'C',
    value: 'c',
  },
  {
    label: 'C++',
    value: 'cpp',
  },
  {
    label: 'C#',
    value: 'csharp',
  },
  {
    label: 'Go',
    value: 'go',
  },
  {
    label: 'Java',
    value: 'java',
  },
  {
    label: 'PHP',
    value: 'php',
  },
  {
    label: 'Rust',
    value: 'rust',
  },
  {
    label: 'Scala',
    value: 'scala',
  },
  {
    label: 'SQL',
    value: 'sql',
  },
  {
    label: 'Swift',
    value: 'swift',
  },
  {
    label: 'YAML',
    value: 'yaml',
  },
];
