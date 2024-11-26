import { isMatching, match, P } from "ts-pattern";
import * as opType from "./operation-type";

export interface Operation {
  cell?: opType.SingleCellChange[];
  range?: opType.RangeCellsChange[];
  row?: (opType.DeleteRow | opType.InsertRow)[];
  col?: (opType.DeleteCol | opType.InsertCol)[];
}

// apply(a, b) = apply(b, a)
export function transform(op1: Operation, op2: Operation): Operation {
  let { cell, range, row, col } = op1;
  if (cell && cell.length > 0) {
    cell = cell.map((change) => {});
  }
}

function transformCell(
  cellChange: opType.SingleCellChange,
  op: Operation
): opType.SingleCellChange | null {
  const { colName, rowId, value } = cellChange;

  return match(op)
    .returnType<null | opType.SingleCellChange>()
    .with({ row: P.array({ deleteRowId: rowId }) }, () => null)
    .with({ col: P.array({ deleteColName: colName }) }, () => null)
    .with(
      {
        range: P.array({
          colNames: P.when((names) => names.includes(colName)),
          rowIds: P.when((ids) => ids.includes(rowId)),
        }),
      },
      () => null
    )
    .with(
      {
        cell: P.array({
          rowId,
          colName,
        }),
      },
      () => null
    )
    .otherwise(() => cellChange);
}
