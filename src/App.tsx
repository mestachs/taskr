import {
  Button,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { useMemo, useState } from "react";
import { evalCode } from "./lib/CodeEvaluator";
import { Results } from "./components/Results";

import * as prettier from "prettier/standalone.mjs";
import prettierPluginBabel from "prettier/plugins/babel.mjs";
import prettierPluginEstree from "prettier/plugins/estree.mjs";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const defaultCodeSnippets = [
  `
  let root = "./"
  
  const db = await gpkg.loadAndCache("play",  root+"org_units-2023-11-28-17-03.gpkg.zip");
    
  const mode = "orgUnits" // "submissions" "schema" "orgUnits"
  let results = []
    
  if (mode == "orgUnits") {
    results = results.concat(await db.exec('SELECT * FROM "level-1-National"').get.objs)
    results = results.concat(await db.exec('SELECT * FROM "level-2-District"').get.objs)
    results = results.concat(await db.exec('SELECT * FROM "level-3-Chiefdom"').get.objs)
    results = results.concat(await db.exec('SELECT * FROM "level-4-Facility"').get.objs)
  
    for (let r of results) {
      r.geometryType = r.geom?.type
    }
  
  return results
  } else if (mode == "schema") {
  
   // get the tables from the gpkg
   return await db.exec('SELECT * FROM sqlite_schema').get.objs
  } else if (mode == "submissions") {
  
  results = await db.exec(\`select json_extract(json,'$."de388__15y"') as "de388__15y", period, submissions.name , org_unit_id ,  facilities.name as facility_name from submissions join "level-4-Facility" as facilities on facilities.id = submissions.org_unit_id order by period, submissions.name\`).get.objs  
  
  return results
  } else {
    throw new Error("mode no supported "+mode) 
  }
  `,

  "return {'hello':'world'}",
];

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [code, setCode] = useState<string>(defaultCodeSnippets[0]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState<string>("");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light"//prefersDarkMode ? "dark" : "light"
        },
        typography: {
          h1: {
            fontSize: 16,
            fontWeight: 400,
          },
          body1: {
            fontFamily: "monospace",
            fontSize: 18,
          },
        },
      }),
    [prefersDarkMode]
  );

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

      const r = await evalCode(formattedCode, { logger: setStatus });
      const end = new Date();
      const elapsed = end.getTime() - start.getTime();
      console.log(
        new Date().toUTCString(),
        "Results calculated in " + elapsed + " ms"
      );
      setStatus("Results calculated in " + elapsed + " ms");
      setResults(r);
    } catch (error: any) {
      setStatus("Error : " + error.message);
      setResults(error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ width: "50%" }}>
          <CodeMirror
            theme="light"
            value={code}
            height="40vh"
            extensions={[javascript({ jsx: true })]}
            onChange={(e) => setCode(e)}
          />

          <Button onClick={runCode} variant="contained" color="primary">
            Run
          </Button>
          <br></br>
          <span>{status}</span>
        </div>
        <div>{results && <Results results={results} />}</div>
      </div>
    </ThemeProvider>
  );
}

export default App;