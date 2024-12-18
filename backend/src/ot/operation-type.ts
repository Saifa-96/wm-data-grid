export interface SingleCellChange {
  colName: string;
  rowId: string;
  value: string;
}

// export interface RangeCellsChange {
//   colNames: string[];
//   rowIds: string[];
//   values: string[][];
// }

export type RowChange = DeleteRow | InsertRow;

export type ColChange = DeleteCol | InsertCol;

export interface DeleteRow {
  rowId: string
}

export interface InsertRow {
  data: Record<string, unknown>;
}

export interface DeleteCol {
  colId: string
}

export interface InsertCol {
  prevColId: string | null;
  colName: string;
}
