import { Editor as MonacoEditor } from '@monaco-editor/react';
import Spinner from '../../components/spinner';

type EditorProps = {
  fileName: string;
  onChange: (code: string | undefined) => void;
  sampleCode: string;
};

const EDITOR_THEME = 'flipbook-theme';

export default function Editor({
  fileName,
  onChange,
  sampleCode,
}: EditorProps): JSX.Element {
  return (
    <MonacoEditor
      className="h-64 mb-10 mt-2 -ml-4"
      defaultValue={sampleCode}
      language={fileName}
      loading={<Spinner />}
      onMount={(_e, m) => {
        m.editor.defineTheme(EDITOR_THEME, {
          base: 'vs-dark',
          colors: {
            'editor.background': '#111827',
          },
          inherit: true,
          rules: [
            {
              background: '111827',
              token: '',
            },
          ],
        });

        m.editor.setTheme(EDITOR_THEME);
      }}
      options={{
        fontSize: 16,
        minimap: {
          enabled: false,
        },
        scrollBeyondLastLine: false,
        scrollbar: {
          horizontal: 'hidden',
          vertical: 'visible',
        },
        wordWrap: 'on',
      }}
      onChange={(code) => onChange(code)}
    />
  );
}
