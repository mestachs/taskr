import XlsxPopulate from "xlsx-populate";

function toObjects(sheet) {
  if (sheet === undefined || sheet.usedRange() === undefined) {
    return [];
  }
  const content = sheet.usedRange().value();
  const columns = content[0];
  const records = content
    .slice(1)
    .map((row, rowIndex) => {
      const obj = { rowIndex };
      let index = 0;
      for (let column of columns) {
        // make sure the column is a text and not a rich text
        if (column && column.text) {
          column = column.text();
        }
        if (column !== "" && column !== undefined) {
          let value = row[index];
          // make sure richt text are turned into text
          if (value && value.text) {
            value = value.text();
          }
          obj[column] =
            value && value.trim
              ? value
                  .trim()
                  .replace(/[\u2018\u2019]/g, "'") // fancy/curly office quotes to straight one
                  .replace(/[\u201C\u201D]/g, '"')
              : value;
        }
        index = index + 1;
      }
      return obj;
    })
    .filter((record) => {
      const filledColumns = Object.keys(record)
        .map((k) => record[k])
        .filter((v) => v !== undefined);
      return filledColumns.length > 1;
    });

  return records;
}

XlsxPopulate.helper = {
  toObjects: toObjects,
};

export default XlsxPopulate;
