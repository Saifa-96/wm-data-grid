import * as d from "./data-grid";
import * as o from "./operation";

export class OperationalTransformation {
  store: d.DataGrid;
  operations: o.Operation[];

  constructor() {
    this.store = d.getDefaultDataGrid();
    this.operations = [];
  }

  getDataByPage(page: number) {
    const rows = d.getRowsByPage(this.store, page);
    return {
      header: this.store.header,
      rows,
      total: this.store.data.length,
    };
  }

  receiveOperation(revision: number, operation: o.Operation) {
    if (revision < 0 || this.operations.length < revision) {
      throw new Error("operation revision not in history");
    }
  }
}
