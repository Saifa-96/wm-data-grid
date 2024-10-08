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
  height: number;
/**
*/
  width: number;
/**
*/
  x: number;
/**
*/
  y: number;
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
*/
  constructor();
/**
* @returns {any}
*/
  get_cells(): any;
/**
* @param {Direction} direction
*/
  move_selected_cell(direction: Direction): void;
/**
* @returns {any}
*/
  get_cell(): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_datagrid_free: (a: number, b: number) => void;
  readonly datagrid_new: () => number;
  readonly datagrid_get_cells: (a: number) => number;
  readonly datagrid_move_selected_cell: (a: number, b: number) => void;
  readonly datagrid_get_cell: (a: number) => number;
  readonly __wbg_cell_free: (a: number, b: number) => void;
  readonly __wbg_get_cell_x: (a: number) => number;
  readonly __wbg_set_cell_x: (a: number, b: number) => void;
  readonly __wbg_get_cell_y: (a: number) => number;
  readonly __wbg_set_cell_y: (a: number, b: number) => void;
  readonly __wbg_get_cell_width: (a: number) => number;
  readonly __wbg_set_cell_width: (a: number, b: number) => void;
  readonly __wbg_get_cell_height: (a: number) => number;
  readonly __wbg_set_cell_height: (a: number, b: number) => void;
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
