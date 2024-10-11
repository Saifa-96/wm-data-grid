/* tslint:disable */
/* eslint-disable */
/**
*/
export enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3,
}
/**
*/
export class Cell {
  free(): void;
/**
*/
  col: number;
/**
*/
  row: number;
/**
*/
  width: number;
}
/**
*/
export class CellProperty {
  free(): void;
}
/**
*/
export class DataGrid {
  free(): void;
/**
* @param {number} width
* @param {number} height
*/
  constructor(width: number, height: number);
/**
* @param {number} start_row_idx
* @param {number} start_col_idx
* @returns {any}
*/
  get_grid(start_row_idx: number, start_col_idx: number): any;
/**
* @returns {any}
*/
  get_spreadsheet_data(): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_datagrid_free: (a: number, b: number) => void;
  readonly datagrid_new: (a: number, b: number) => number;
  readonly datagrid_get_grid: (a: number, b: number, c: number) => number;
  readonly datagrid_get_spreadsheet_data: (a: number) => number;
  readonly __wbg_cell_free: (a: number, b: number) => void;
  readonly __wbg_get_cell_row: (a: number) => number;
  readonly __wbg_set_cell_row: (a: number, b: number) => void;
  readonly __wbg_get_cell_col: (a: number) => number;
  readonly __wbg_set_cell_col: (a: number, b: number) => void;
  readonly __wbg_get_cell_width: (a: number) => number;
  readonly __wbg_set_cell_width: (a: number, b: number) => void;
  readonly __wbg_cellproperty_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
