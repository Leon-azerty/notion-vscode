import {
  VSCodeButton,
  VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import { useEffect, useState } from 'react';
import RetrieveBlock from './retrieveBlock/retrieveBlock.js';

declare const acquireVsCodeApi: any;

const vscode = acquireVsCodeApi();

function App() {
  const [blockId, setBlockId] = useState<string>('');
  const [pageIdRes, setPageIdRes] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [pageNames, setPageNames] = useState<string[]>([]);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      console.log('Réponse du serveur LSP:', message);
      if (message.pageId) setPageIdRes(message.pageId);
      else if (message.type === 'NotionPagesName') {
        console.log('message received', message);
        setPageNames(message.response);
      }
    });

    vscode.postMessage({
      command: 'init',
    });

    return () => {
      window.removeEventListener('message', () => {});
    };
  }, []);

  return (
    <div className="grid gap-3 p-2 place-items-start">
      <h1>VS Code WebView</h1>
      {pageNames.map((pageName, index) => (
        <p key={index}>{pageName}</p>
      ))}
      <RetrieveBlock
        setBlockId={setBlockId}
        blockId={blockId}
        vscode={vscode}
      />

      <div className="border">
        <label htmlFor="search">Search</label>
        <VSCodeTextField
          placeholder="demo ..."
          id="search"
          onChange={(e) => {
            console.log('search', search);
            setSearch((e.target as HTMLInputElement).value);
          }}
        />
        <VSCodeButton
          className="bg-purple-300"
          onClick={() => {
            console.log('search', search);
            vscode.postMessage({
              command: 'GetNotionPageId',
              query: search,
            });
          }}
        >
          Get Notion Page ID
        </VSCodeButton>
        <p>{pageIdRes}</p>
      </div>
    </div>
  );
}

export default App;
