import { Column, DataItem, genData, genHeader } from "../faker-data";
import * as o from "./operation";

export interface DataGrid {
  header: Column[];
  data: DataItem[];
  revision: number;
}

export function getDefaultDataGrid(): DataGrid {
  const data = Array(4).fill(null).map(genData).flat();
  const header = genHeader();
  return {
    revision: 0,
    data,
    header,
  };
}

export function getRowsByPage(
  dataGrid: DataGrid,
  page: number,
  size: number = 100
) {
  return dataGrid.data.slice(page - 1, size);
}

export function applyOperation(
  dataGrid: DataGrid,
  operation: o.Operation
): DataGrid {
  const { colName, rowId, value } = operation;
  const index = dataGrid.data.findIndex((item) => item.id === rowId);
  const newData = { ...dataGrid };
  if (index !== -1) {
    const row = newData.data[index];
    if (Object.hasOwn(row, colName)) {
      row[colName] = value;
    }
  }
  return newData;
}
