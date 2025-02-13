import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import { useEffect, useState } from 'react';
import RefreshCcwDot from './icons/refreshCcwDot.js';
import Search from './icons/search.js';
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
      <div className="flex space-x-4">
        <h1>Pages</h1>
        <RefreshCcwDot
          onClick={() => {
            vscode.postMessage({
              command: 'GetNotionPageId',
              query: '',
            });
          }}
        />
      </div>

      <div className="border flex space-x-2">
        <VSCodeTextField
          placeholder="Search ..."
          id="search"
          onChange={(e) => {
            console.log('search', search);
            setSearch((e.target as HTMLInputElement).value);
          }}
        />
        <Search
          onClick={() => {
            console.log('search', search);
            vscode.postMessage({
              command: 'GetNotionPageId',
              query: search,
            });
          }}
        />
        <p>{pageIdRes}</p>
      </div>
      {pageNames.map((pageName, index) => (
        <button
          key={index}
          onClick={() => {
            console.log('pageName', pageName);
            vscode.postMessage({
              command: 'GetNotionPageContent',
              pageName: pageName,
            });
          }}
        >
          {pageName}
        </button>
      ))}

      <div className="border">
        <RetrieveBlock
          setBlockId={setBlockId}
          blockId={blockId}
          vscode={vscode}
        />
      </div>
    </div>
  );
}

export default App;
