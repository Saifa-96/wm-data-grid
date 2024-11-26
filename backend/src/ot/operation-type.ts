export interface SingleCellChange {
  colName: string;
  rowId: string;
  value: string;
}

export interface RangeCellsChange {
  colNames: string[];
  rowIds: string[];
  values: string[][];
}

export interface DeleteRow {
  deleteRowId: string;
}

export interface InsertRow {
  prevRowId?: string;
  data: unknown;
}

export interface DeleteCol {
  deleteColName: string;
}

export interface InsertCol {
  prevColName?: string;
  colName: string;
}
