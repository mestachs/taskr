import {
  Button,
} from "@mui/material";
import { useState } from "react";
import * as prettier from "prettier/standalone.mjs";
import prettierPluginBabel from "prettier/plugins/babel.mjs";
import prettierPluginEstree from "prettier/plugins/estree.mjs";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { evalCode } from "../lib/CodeEvaluator";

const defaultCodeSnippets = [
  `
  // turn a datasettes about powerplant : https://global-power-plants.datasettes.com/
  // hosted it zipped here
  const db = await gpkg.loadAndCache(
    "global-power-plants",
    "./data/global-power-plants.db.zip",
  );
  
  // use sql to create a point from the longitude/latitude via spatialite
  
  return await db.exec(\`  
    with colors as (
        select distinct primary_fuel ,  
               ('#' || hex(randomblob(3)) ) as color 
        from  [global-power-plants] group by primary_fuel)
    select color,*,
     MakePoint(longitude, latitude, 4326) as geom 
    from [global-power-plants]
    join colors on colors.primary_fuel = [global-power-plants].primary_fuel
    limit 1000
    \`).get.objs;
  
  `,
  ` 
  const db = await gpkg.loadAndCache("play",  "./data/org_units-2023-11-28-17-03.gpkg.zip");
    
  const mode = "submissions" // "submissions" "schema" "orgUnits"
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
  
  results = await db.exec(\`
  select 
    json_extract(json,'$."de388__15y"') as "de388__15y", 
    period, submissions.name , org_unit_id ,  
    facilities.name as facility_name, facilities.geom as geom
    from submissions join "level-4-Facility" as facilities on facilities.id = submissions.org_unit_id 
    order by period, submissions.name\`).get.objs  
  
    // show the district on the same map
    results = results.concat(
      await db.exec('SELECT * FROM "level-2-District"').get.objs,
    );

  return results
  } else {
    throw new Error("mode no supported "+mode) 
  }
  `,

  "return {'hello':'world'}",
];

export function CodeEditor({onDone}) {
  const [code, setCode] = useState<string>(defaultCodeSnippets[0]);
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

      const r = await evalCode(formattedCode, { logger: setStatus });
      const end = new Date();
      const elapsed = end.getTime() - start.getTime();
      console.log(
        new Date().toUTCString(),
        "Results calculated in " + elapsed + " ms"
      );
      setStatus("Results calculated in " + elapsed + " ms");
      onDone("success", r)
    } catch (error: any) {
      setStatus("Error : " + error.message);
      onDone("error", error)
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <CodeMirror
        style={{ maxHeight: "95%", height: "95%" }}
        height="98%"
        theme="light"
        value={code}
        extensions={[javascript({ jsx: true })]}
        onChange={(e) => setCode(e)}
      />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Button onClick={runCode} variant="contained" color="primary">
          Run
        </Button>
        &nbsp;&nbsp;
        <div>{status}</div>
      </div>
    </div>
  );
}
