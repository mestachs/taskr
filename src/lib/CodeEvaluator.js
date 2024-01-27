import SPL from "spl.js";
import * as zip from "@zip.js/zip.js";
import * as osm2geojson from "osm2geojson-lite" ;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const gpkg = {
  loadAndCache: async (identifier, url) => {
    if (window[identifier] == undefined) {
      const start = new Date();

      const spl = await SPL();
      console.log(url);
      let gpkgContent = undefined;
      if (url.endsWith(".zip")) {
        const data = await fetch(url).then((response) =>
          response.blob()
        );
        const zipReader = new zip.ZipReader( new zip.BlobReader(data));
        const firstEntry = (await zipReader.getEntries()).shift();
        
        const arry = await firstEntry.getData(new zip.Uint8ArrayWriter());
        gpkgContent = arry.buffer
      } else {
        gpkgContent = await fetch(url).then((response) =>
          response.arrayBuffer()
        );
      }
      const end = new Date();
      const elapsed = end.getTime() - start.getTime();
      console.log("downloaded in " + elapsed + " ms");
      const db = await spl
        .db(gpkgContent)
        .exec("SELECT EnableGpkgAmphibiousMode()");
      window[identifier] = db;
    }
    return window[identifier];
  },
};

export const evalCode = async (code, parameters) => {
  const body = code.includes("return ") ? code : "return " + code;
  const libs = [
    {
      identifier: "_",
      entryPoint: async () => {
        const lodash = await import("./support/lodash");
        return lodash.default;
      },
    },
    {
      identifier: "turf",
      entryPoint: async () => {
        const turf = await import("./support/turf");
        return turf.default;
      },
    },
    {
      identifier: "PapaParse",
      entryPoint: async () => import("papaparse"),
    },

    {
      identifier: "XlsxPopulate",
      entryPoint: async ()=> {
        const xlspopulate = await import("./support/xlspopulate");
        return xlspopulate.default;
      },
    },
    { identifier: "parameters", entryPoint: async () => parameters },
    { identifier: "gpkg", entryPoint: async () => gpkg },
    {
      identifier: "osmtogeojson",
      entryPoint: async () => {
        return osm2geojson;
      },
    },    
  ];
  const entryPoints = [];
  for (let entryPoint of libs.map((l) => l.entryPoint)) {
    entryPoints.push(await entryPoint());
  }

  entryPoints.push(SPL);
  const results = await new AsyncFunction(
    ...libs.map((l) => l.identifier),
    "SPL",
    body
  )(...entryPoints);
  return results;
};
