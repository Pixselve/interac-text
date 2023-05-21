"use client";
import { useState } from "react";

type Props = {
  languages: {
    name: string;
    clients: {
      name: string;
      snippetWithKeys: string;
      snippetRedactedKeys: string;
    }[];
  }[];
};
export default function ApiSnippets({ languages }: Props) {
  const [client, setClient] = useState<Props["languages"][0]["clients"][0]>(
    languages[0].clients[0]
  );

  const [showKeys, setShowKeys] = useState(false);

  return (
    <div className="space-y-4">
      <select
        onChange={(e) => {
          const [language, clientName] = e.target.value.split("/");
          const languageObj = languages.find((l) => l.name === language);
          if (!languageObj) {
            throw new Error(`Language not found: ${language}`);
          }
          const clientObj = languageObj.clients.find(
            (c) => c.name === clientName
          );
          if (!clientObj) {
            throw new Error(`Client not found: ${clientName}`);
          }
          setClient(clientObj);
        }}
        className="select w-full"
      >
        {languages.map((language) => (
          <optgroup key={language.name} label={language.name}>
            {language.clients.map((client) => (
              <option
                key={client.name}
                value={`${language.name}/${client.name}`}
              >
                {client.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <div className="form-control">
        <label className="label cursor-pointer">
          <input
            onChange={(e) => setShowKeys(e.target.checked)}
            type="checkbox"
            className="checkbox"
          />
          <span className="label-text">Include the keys</span>
        </label>
      </div>
      <pre className="bg-black/10 p-4 rounded-xl">
        {showKeys ? (
          <code>
            <pre>{client.snippetWithKeys}</pre>
          </code>
        ) : (
          <code>
            <pre>{client.snippetRedactedKeys}</pre>
          </code>
        )}
      </pre>
    </div>
  );
}
