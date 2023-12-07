import React, { useState, useEffect } from "react";
import XlsxPopulate from "xlsx-populate";
import PapaParse from "papaparse";
import SPL from "spl.js";
import {
  FormControl,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Typography,
} from "@mui/material";

const Params = ({ params, onParametersChange }) => {
  const defaultValues = {};
  params.forEach((param) => (defaultValues[param["id"]] = param["default"]));
  useEffect(() => {
    onParametersChange(defaultValues);
  }, []);

  const [parameters, setParameters] = useState(defaultValues);
  const onChange = (e) => {
    const { name, value } = e.target;
    const newParameters = { ...parameters, [name]: value };
    setParameters(newParameters);
    onParametersChange(newParameters);
  };

  function parseGpkg(inputElement) {
    const elementName = inputElement.target.name;
    const files = inputElement.target.files || [];
    if (!files.length) return;
    const file = files[0];
    debugger;

    const reader = new FileReader();

    // Set up an event listener for when the file is loaded
    reader.onload = async function (loadEvent) {
      // The result property contains the ArrayBuffer
      const arrayBuffer = loadEvent.target.result;
      debugger;
      const spl = await SPL();
      const db = await spl.db(arrayBuffer);
      db.exec("SELECT EnableGpkgAmphibiousMode()");
      const newParameters = {
        ...parameters,
        [elementName]: db,
      };
      setParameters(newParameters);
      onParametersChange(newParameters);
    };

    // Read the file as ArrayBuffer
    reader.readAsArrayBuffer(file);
  }

  function parseExcelFile(inputElement) {
    const elementName = inputElement.target.name;
    const files = inputElement.target.files || [];
    if (!files.length) return;
    const file = files[0];
    XlsxPopulate.fromDataAsync(file).then(function (workbook) {
      const newParameters = {
        ...parameters,
        [elementName]: workbook,
      };
      setParameters(newParameters);
      onParametersChange(newParameters);
    });
  }

  function parserJson(inputElement) {
    const elementName = inputElement.target.name;
    const files = inputElement.target.files || [];
    var reader = new FileReader();
    if (!files.length) return;
    const file = files[0];
    reader.onload = function (event) {
      var jsonObj = JSON.parse(event.target.result);

      const newParameters = {
        ...parameters,
        [elementName]: jsonObj,
      };
      setParameters(newParameters);
      onParametersChange(newParameters);
    };

    reader.readAsText(file);
  }

  function parserCsv(evt) {
    const files = evt.target.files || [];
    if (!files.length) return;
    var file = evt.target.files[0];
    const elementName = evt.target.name;
    PapaParse.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function (data) {
        const newParameters = {
          ...parameters,
          [elementName]: data,
        };
        setParameters(newParameters);
        onParametersChange(newParameters);
      },
    });
  }

  const style = { marginBottom: "10px", width: 400 };
  return (
    <>
      {params && Object.keys(params).length > 0 && <h3>Parameters</h3>}
      {params.map((param) => {
        const k = param.id;
        const v = param;
        const label = param.label || k;
        return (
          <div>
            {v.type == "select" && (
              <FormControl>
                <InputLabel style={{ marginLeft: "10px" }}>{label}</InputLabel>
                <Select
                  name={k}
                  value={parameters[k]}
                  onChange={onChange}
                  style={style}
                  helperText={v.helperText}
                >
                  {v.choices.map(([val, label]) => (
                    <MenuItem key={val} value={val}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {v.type == "text" && (
              <TextField
                width={200}
                name={k}
                label={label}
                value={parameters[k]}
                onChange={onChange}
                style={style}
                helperText={v.helperText}
              />
            )}
            {v.type == "xlsx" && (
              <>
                <InputLabel style={{ marginLeft: "10px" }}>{label}</InputLabel>
                <input
                  type="file"
                  name={k}
                  onChange={parseExcelFile}
                  accept=".xlsx"
                  style={style}
                  helperText={v.helperText}
                ></input>
                <p>{v.helperText}</p>
              </>
            )}
            {v.type == "csv" && (
              <>
                <InputLabel style={{ marginLeft: "10px" }}>{label}</InputLabel>
                <input
                  type="file"
                  name={k}
                  onChange={parserCsv}
                  accept=".csv"
                  style={style}
                ></input>
                <Typography>{v.helperText}</Typography>
              </>
            )}
            {v.type == "json" && (
              <>
                <InputLabel style={{ marginLeft: "10px" }}>{label}</InputLabel>
                <input
                  type="file"
                  name={k}
                  onChange={parserJson}
                  accept=".json"
                  style={style}
                ></input>
                <Typography>{v.helperText}</Typography>
              </>
            )}

            {v.type == "gpkg" && (
              <>
                <InputLabel style={{ marginLeft: "10px" }}>{label}</InputLabel>
                <input
                  type="file"
                  name={k}
                  onChange={parseGpkg}
                  accept=".gpkg"
                  style={style}
                ></input>
                <Typography>{v.helperText}</Typography>
              </>
            )}

            <br></br>
          </div>
        );
      })}
    </>
  );
};

export default Params;
