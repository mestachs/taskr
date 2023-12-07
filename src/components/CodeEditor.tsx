import { Button } from "@mui/material";
import { useState } from "react";
import * as prettier from "prettier/standalone.mjs";
import prettierPluginBabel from "prettier/plugins/babel.mjs";
import prettierPluginEstree from "prettier/plugins/estree.mjs";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { evalCode } from "../lib/CodeEvaluator";
import Params from "./Params";

export function CodeEditor({ onDone, recipe }) {
  const [code, setCode] = useState<string>(recipe.code);
  const [parameters, setParameters] = useState<any>({});

  const [status, setStatus] = useState<string>("");

  const runCode = async () => {
    try {
      const start = new Date();
      console.log(new Date().toUTCString(), "Launching code snippet");
      setStatus("Running");

      const formattedCode = await prettier.format(code, {
        parser: "babel",
        plugins: [prettierPluginBabel, prettierPluginEstree],
      });
      setCode(formattedCode);

      const r = await evalCode(formattedCode, {
        ...parameters,
        logger: setStatus,
      });
      const end = new Date();
      const elapsed = end.getTime() - start.getTime();
      console.log(
        new Date().toUTCString(),
        "Results calculated in " + elapsed + " ms"
      );
      setStatus("Results calculated in " + elapsed + " ms");
      onDone("success", r);
    } catch (error: any) {
      setStatus("Error : " + error.message);
      onDone("error", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Params
        params={recipe.params.parameters}
        onParametersChange={(newParameters) => setParameters(newParameters)}
      ></Params>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Button onClick={runCode} variant="contained" color="primary">
          Run
        </Button>
        &nbsp;&nbsp;
        <div>{status}</div>
      </div>
      <CodeMirror
        style={{ maxHeight: "95%", height: "95%" }}
        height="98%"
        theme="light"
        value={code}
        extensions={[javascript({ jsx: true })]}
        onChange={(e) => setCode(e)}
      />
    </div>
  );
}
