import { Client } from '@notionhq/client';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  createConnection,
  InitializeParams,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
let notion: Client;

connection.onInitialize((params: InitializeParams) => {
  console.log('🔹 LSP Server: Initializing...');
  notion = new Client({
    auth: `ntn_${params.initializationOptions.token}`,
  });
  connection.console.log('🔹 LSP Server: Initializing...'); // Visible dans Output de VS Code

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental, // Correction ici
    },
  };
});

connection.onNotification('workspace/didChangeToken', (params) => {
  console.log('Nouveau token reçu:', params.token);
});

connection.onRequest('custom/GetNotionPageId', async (params: any) => {
  console.log('GetNotionPageId, params :', params);

  const response = await notion.search({
    query: params.query,
    filter: {
      value: 'page',
      property: 'object',
    },
    sort: {
      direction: 'ascending',
      timestamp: 'last_edited_time',
    },
  });
  const pageNames: Array<string> = [];
  for (const result of response.results) {
    // @ts-ignore: Unreachable code error
    if (result.parent.type == 'workspace') {
      const page = await notion.blocks.retrieve({
        block_id: result.id,
      });
      if ('child_page' in page) {
        console.log('page child_page title', page.child_page.title);
        pageNames.push(page.child_page.title);
      } else {
        console.log('page', page);
      }
    }
  }

  console.log('pageNames', pageNames);
  return pageNames;
});

// --------------------------------

connection.onRequest('custom/RetrieveBlock', async (params: any) => {
  console.log('params :', params);

  const { blockId } = params;
  const res = await notion.blocks.retrieve({
    block_id: blockId,
  });

  console.log('Notion res : ', res);
  return `Server received: ${params.message}`;
});

// --------------------------------

connection.onRequest('custom/GetNotionPageContent', async (params: any) => {
  console.log('Server received params :', params);
  const pageId = 'f627e079ed324f419a2703107fe733fa';
  const blockId = '190c3201-03f4-803a-876a-c4aa989a18c4';
  const page = await notion.blocks.retrieve({
    block_id: pageId,
  });
  console.log('page', page);

  const pageChildren = await notion.blocks.children.list({
    block_id: blockId,
  });
  console.log('pageChildren', pageChildren);
  pageChildren.results.map(async (result) => {
    if ('to_do' in result) console.log('result.to_do', result.to_do);
  });
});

// --------------------------------

documents.listen(connection);
connection.listen();

console.log('✅ LSP Server: Started!');
