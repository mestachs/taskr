import { HashRouter as Router, Routes, Route } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { useMemo, useState } from "react";

import "react-mosaic-component/react-mosaic-component.css";

import { Mosaic, MosaicWindow } from "react-mosaic-component";

import { Results } from "./components/Results";
import { GithubBasedEditor } from "./components/GithubBasedEditor";

import FetchInterceptor from "./lib/FetchInterceptor";

let setOutRequest = undefined;
FetchInterceptor.register({
  onBeforeRequest(request, _) {
    if (setOutRequest) {
      setOutRequest([request.url, request.method, "running"]);
    }
  },
  onRequestSuccess(response, request, _) {
    if (setOutRequest) {
      setOutRequest([request.url, request.method, "success", response.status]);
    }
  },
  onRequestFailure(response, request, _) {
    if (setOutRequest) {
      setOutRequest([request.url, request.method, "failed", response.status]);
    }
  },
});

export type ViewId = "codeEditor" | "results.map" | "results.table" | "status";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [results, setResults] = useState([]);
  const [lastRun, setLastRun] = useState<string>("");

  const [requests, setRequests] = useState([]);
  setOutRequest = setRequests;
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light", //prefersDarkMode ? "dark" : "light"
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

  const ELEMENT_MAP = new Map<ViewId, JSX.Element>([
    [
      "status",
      <span>
        {requests && requests.length > 1 && (
          <>
            <a href={requests[0]} target="_blank" rel="noopener noreferrer">
              {decodeURIComponent(requests[0])}
            </a>
            {"     "}
            {requests.slice(1).join(" | ")}
          </>
        )}
      </span>
    ],
    [
      "codeEditor",
      <GithubBasedEditor
        onDone={(_status, results) => {
          setLastRun(new Date().toISOString());
          setResults(results);
        }}
      />,
    ],
    [
      "results.table",
      <div style={{ height: "100%" }} id="results.table">
        {results && (
          <Results
            key={"Table." + lastRun}
            results={results}
            initialSelectedTab={1}
          />
        )}
      </div>,
    ],
    [
      "results.map",
      <div id="results.map">
        {results && (
          <Results
            key={"Map." + lastRun}
            results={results}
            initialSelectedTab={2}
          />
        )}
      </div>,
    ],
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path={`/gh/:source_type/:repo/:gistId/*`}
            element={
              <Mosaic<ViewId>
                renderTile={(id: ViewId, path) => (
                  <MosaicWindow<ViewId> path={path} title={id}>
                    {ELEMENT_MAP.get(id)}
                  </MosaicWindow>
                )}
                initialValue={{
                  direction: "row",
                  first: {
                    direction: "column",
                    first: "codeEditor",
                    second: "status",
                    splitPercentage: 92,
                    
                  },
                  second: {
                    direction: "column",
                    first: "results.table",
                    second: "results.map",
                  },
                  splitPercentage: 40,
                }}
                onChange={(props) => {
                  console.log(props);
                }}
              />
            }
          />

          <Route
            path="/"
            element={
              <div style={{ margin: "50px" }}>
                <h1>Sample recipes</h1>
                <ul>
                  <li>
                    <a href="./#/gh/g/mestachs/8a70aa62f2ffb97414a32af5111d743e">
                      Geopackage, json_extract
                    </a>
                  </li>
                  <li>
                    <a href="./#/gh/g/mestachs/7ac45d69b04b1a608620595edc099ec5">
                      Power plant sqlite
                    </a>
                  </li>
                  <li>
                    <a href="./#/gh/g/mestachs/c0fd9058cf5b7a02eae11e1d77ca4d09">
                      Geojson : split belgium in hexagons
                    </a>
                  </li>
                  <li>
                    <a href="./#/gh/g/mestachs/5273bae5c77f319e8883fdaac594632a">
                      Frappe chart
                    </a>
                  </li>

                  <li>
                    <a href="./#/gh/g/mestachs/5185f1984f4ceea43c72387612c8b5b7">
                      turfjs : Center of mass of belgian communes.
                    </a>
                  </li>

                  <li>
                    <a href="./#/gh/g/mestachs/61ec8c5561ca40630df34fc2a6d92f9a">
                      Recipe with parameters showcase
                    </a>
                  </li>
                </ul>
              </div>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
