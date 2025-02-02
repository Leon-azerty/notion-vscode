"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@notionhq/client");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const node_1 = require("vscode-languageserver/node");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
let notion;
connection.onInitialize((params) => {
    console.log('🔹 LSP Server: Initializing...');
    notion = new client_1.Client({
        auth: `ntn_${params.initializationOptions.token}`,
    });
    connection.console.log('🔹 LSP Server: Initializing...'); // Visible dans Output de VS Code
    return {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental, // Correction ici
        },
    };
});
connection.onNotification('workspace/didChangeToken', (params) => {
    console.log('Nouveau token reçu:', params.token);
});
connection.onRequest('custom/GetNotionPageId', async (params) => {
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
    const pageNames = [];
    // console.log('response', response);
    for (const result of response.results) {
        // @ts-ignore: Unreachable code error
        if (result.parent.type == 'workspace') {
            // console.log('result', result);
            const page = await notion.blocks.retrieve({
                block_id: result.id,
            });
            if ('child_page' in page) {
                console.log('page child_page title', page.child_page.title);
                pageNames.push(page.child_page.title);
            }
            else {
                console.log('page', page);
            }
        }
    }
    console.log('pageNames', pageNames);
    return pageNames;
});
// --------------------------------
connection.onRequest('custom/RetrieveBlock', async (params) => {
    console.log('params :', params);
    const { blockId } = params;
    const res = await notion.blocks.retrieve({
        block_id: blockId,
    });
    console.log('Notion res : ', res);
    return `Server received: ${params.message}`;
});
// --------------------------------
documents.listen(connection);
connection.listen();
console.log('✅ LSP Server: Started!');
//# sourceMappingURL=server.js.map