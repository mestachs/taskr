import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import { GistBasedEditor } from "./components/GistBasedEditor";

export type ViewId = "codeEditor" | "results.map" | "results.table";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [results, setResults] = useState([]);
  const [lastRun, setLastRun] = useState<string>("");

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
      "codeEditor",
      <GistBasedEditor
        onDone={(status, results) => {
          setLastRun(new Date().toISOString());
          setResults(results);
        }}
      />,
    ],
    [
      "results.table",
      <div>
        <div style={{ height: "100%" }}>
          {results && (
            <Results
              key={"Table." + lastRun}
              results={results}
              initialSelectedTab={1}
            />
          )}
        </div>
      </div>,
    ],
    [
      "results.map",
      <div>
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
            path={`/gh/g/:repo/:gistId`}
            element={
              <Mosaic<ViewId>
                renderTile={(id: ViewId, path) => (
                  <MosaicWindow<ViewId>
                    path={path}
                    title={id}
                  >
                    {ELEMENT_MAP.get(id)}
                  </MosaicWindow>
                )}
                initialValue={{
                  direction: "column",
                  first: "codeEditor",
                  second: {
                    direction: "row",
                    first: "results.table",
                    second: "results.map",
                  },
                  splitPercentage: 60,
                }}
              />
            }
          />
          <Route
            path="/"
            element={
              <Navigate
                to="/gh/g/mestachs/c0fd9058cf5b7a02eae11e1d77ca4d09"
                replace
              />
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
