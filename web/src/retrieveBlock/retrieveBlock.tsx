import {
  VSCodeButton,
  VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';

export default function RetrieveBlock({
  blockId,
  setBlockId,
  vscode,
}: {
  blockId: string;
  setBlockId: (blockId: string) => void;
  vscode: any;
}) {
  return (
    <section>
      <label htmlFor="blockId">blockId</label>
      <VSCodeTextField
        id="blockId"
        placeholder="blockId"
        onChange={(e) => {
          console.log('e.target', e.target);
          setBlockId((e.target as HTMLInputElement).value);
        }}
      />
      <VSCodeButton
        className="bg-red-500"
        onClick={() => {
          console.log('in front, blockId:', blockId);
          vscode.postMessage({
            command: 'RetrieveBlock',
            blockId: blockId,
          });
        }}
      >
        Retrieve Block
      </VSCodeButton>
    </section>
  );
}
