import { concat, differenceWith, isEmpty, union, unionWith } from 'lodash';
import { type Identity, isIdentityEqual } from './identity';

export interface UpdateCell<ID extends Identity = Identity> {
  colId: ID;
  rowId: ID;
  value: string;
}

export interface Operation {
  updateCells?: UpdateCell[];
  deleteRows?: Identity[];
  insertRows?: InsertRow[];
  deleteCols?: Identity[];
  insertCols?: InsertCol[];
}

export interface InsertRow<ID extends Identity = Identity> {
  id: ID;
  data: {
    colId: ID;
    value: unknown;
  }[];
}

export interface InsertCol<ID extends Identity = Identity> {
  id: ID;
  index: number;
  colName: string;
  type: string;
}

// apply(apply(S, A), B) = apply(S, compose(A, B))
export function compose(op1: Operation, op2: Operation): Operation {
  const op1Filled = fillOperation(op1);
  const op2Filled = fillOperation(op2);
  const operation = fillOperation();

  operation.deleteRows = union(op2Filled.deleteRows, op1Filled.deleteRows);
  operation.deleteCols = union(op2Filled.deleteCols, op1Filled.deleteCols);

  operation.insertRows = differenceWith(
    concat(op2Filled.insertRows, op1Filled.insertRows),
    operation.deleteRows,
    ({ id }, delId) => isIdentityEqual(id, delId)
  );

  operation.insertCols = differenceWith(
    concat(op2Filled.insertCols, op1Filled.insertCols),
    operation.deleteCols,
    ({ id }, delId) => isIdentityEqual(id, delId)
  );

  const cellChanges = unionWith(
    op2Filled.updateCells,
    op1Filled.updateCells,
    (cell2, cell1) =>
      isIdentityEqual(cell2.colId, cell1.colId) &&
      isIdentityEqual(cell2.rowId, cell1.rowId)
  ).filter((change) => {
    return !(
      operation.deleteRows.some((id) => isIdentityEqual(id, change.rowId)) ||
      operation.deleteCols.some((id) => isIdentityEqual(id, change.colId))
    );
  });

  const [updateCells, insertRows] = consumeUpdateCells(
    cellChanges,
    operation.insertRows
  );
  operation.updateCells = updateCells;
  operation.insertRows = insertRows;

  return strip(operation);
}

function consumeUpdateCells(
  updateCells: UpdateCell[],
  insertRows: InsertRow[]
): [UpdateCell[], InsertRow[]] {
  let rowChanges: InsertRow[] = [...insertRows];
  let cellChanges: UpdateCell[] = [];
  for (const change of updateCells) {
    const rowChangeIndex = insertRows.findIndex(({ id }) =>
      isIdentityEqual(id, change.rowId)
    );

    if (rowChangeIndex === -1) {
      cellChanges.push(change);
    } else {
      const rowChange = insertRows[rowChangeIndex];
      rowChanges[rowChangeIndex] = {
        ...rowChange,
        data: rowChange.data.map((cellChange) =>
          isIdentityEqual(cellChange.colId, change.colId)
            ? { ...cellChange, value: change.value }
            : cellChange
        ),
      };
    }
  }

  return [cellChanges, rowChanges];
}

// apply(apply(S, A), B') = apply(apply(S, B), A')
export function transform(
  currentOperation: Operation,
  receivedOperation: Operation
): [Operation, Operation] {
  const op1Prime = fillOperation(receivedOperation);
  const op2Prime = fillOperation(currentOperation);

  op1Prime.updateCells = op1Prime.updateCells.filter((change) => {
    const { colId, rowId } = change;
    const { deleteCols, deleteRows, updateCells } = op2Prime;
    return !(
      deleteCols.some((col) => isIdentityEqual(col, colId)) ||
      deleteRows.some((row) => isIdentityEqual(row, rowId)) ||
      updateCells.some(
        (c) =>
          isIdentityEqual(c.colId, change.colId) &&
          isIdentityEqual(c.rowId, change.rowId)
      )
    );
  });

  op2Prime.updateCells = op2Prime.updateCells.filter((change) => {
    const { colId, rowId } = change;
    const { deleteCols, deleteRows } = op1Prime;
    return !(
      deleteCols.some((col) => isIdentityEqual(col, colId)) ||
      deleteRows.some((row) => isIdentityEqual(row, rowId))
    );
  });

  return [strip(op2Prime), strip(op1Prime)];
}

type Required<T> = {
  [P in keyof T]-?: T[P];
};

export function fillOperation(op: Operation = {}): Required<Operation> {
  return {
    deleteRows: [],
    deleteCols: [],
    insertRows: [],
    insertCols: [],
    updateCells: [],
    ...op,
  };
}

export function strip(o: Required<Operation>) {
  const newOp = { ...o };
  Object.entries(o).forEach(([key, value]) => {
    if (isEmpty(value)) {
      delete newOp[key as keyof Operation];
    }
  });
  return newOp;
}
