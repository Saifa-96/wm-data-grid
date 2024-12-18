import { match, P } from "ts-pattern";
import * as opType from "./operation-type";
import { clone } from "lodash";

export interface Operation {
  cellChanges?: opType.SingleCellChange[];
  rowChanges?: opType.RowChange[];
  colChanges?: opType.ColChange[];
}

// apply(a, b) = apply(b, a)
export function transform(op1: Operation, op2: Operation): [Operation, Operation] {
  const op1Prime: Operation = {};
  let op2Prime: Operation = op2;

  const { cellChanges, rowChanges, colChanges } = op1;
  if (cellChanges && cellChanges.length > 0) {
    const [changes, transformedOp2] = transformCell(cellChanges, op2Prime);
    op1Prime.cellChanges = changes;
    op2Prime = transformedOp2;
  }

  if (rowChanges && rowChanges.length > 0) {
    const [changes, transformedOp2] = transformRow(rowChanges, op2Prime);
    op1Prime.rowChanges = changes;
    op2Prime = transformedOp2;
  }

  if (colChanges && colChanges.length > 0) {
    const [changes, transformedOp2] = transformCol(colChanges, op2Prime);
    op1Prime.colChanges = changes;
    op2Prime = transformedOp2
  }


  return [op1Prime, op2Prime];
}

function transformCell(
  cellChanges: opType.SingleCellChange[],
  op: Operation
): [opType.SingleCellChange[], Operation] {

  const changes = cellChanges.map(change => {
    const { rowId, colName } = change;
    return match(op)
      .returnType<null | opType.SingleCellChange>()
      .with({ rowChanges: P.array({ rowId }) }, () => null)
      .with({ colChanges: P.array({ colName }) }, () => null)
      .with(
        {
          cellChanges: P.array({
            rowId,
            colName,
          }),
        },
        () => null
      )
      .otherwise(() => change)
  }).filter(change => !!change)

  return [changes, op]
}

function transformRow(rowChanges: opType.RowChange[], op: Operation): [opType.RowChange[], Operation] {
  let opPrime = clone(op);

  // const changes = rowChanges.map(change => {
  //   return match(change)
  //     .returnType<opType.RowChange>()
  //     .with({ data: P.nonNullable }, (c) => {
  //       opPrime.rowChanges?.unshift(c);
  //       return c;
  //     }).otherwise((c) => {
  //       return c
  //     })
  // })

  let changes: opType.RowChange[] = [];
  for (const change of rowChanges) {
    match(change)
      .with({ data: P.nonNullable }, (c) => {
        changes.push(c);
        opPrime.rowChanges?.unshift(c);
      }).otherwise((c) => {
        const { rowId } = c;
        opPrime.cellChanges = opPrime.cellChanges?.filter(cellChange => cellChange.rowId !== rowId);
        opPrime.rowChanges = 
      })
  }

  return [changes, opPrime]
}


function mergeDeleteRow(change: opType.DeleteRow, op: Operation) {

}