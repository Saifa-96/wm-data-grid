use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct DataGrid {
    row_heights: Vec<usize>,
    col_widths: Vec<usize>,
    row_count: usize,
    col_count: usize,
    cell_properties: Vec<Vec<CellProperty>>,
    cells: Vec<Cell>,
    selected_cell_range: Option<SelectedCellRange>,
}

#[wasm_bindgen]
impl DataGrid {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let row_count = 100;
        let col_count = 100;
        let row_heights = vec![26; row_count];
        let col_widths = vec![100; col_count];

        let cell_properties = Self::create_grid(
            row_count,
            col_count,
            CellProperty {
                text_align: TextAlign::Left,
            },
        );

        let cells = Self::draw_cells(
            row_count,
            col_count,
            // &cell_properties,
            &row_heights,
            &col_widths,
        );

        let range = SelectedCellRange {
            start_row: 0,
            start_col: 0,
            end_row: 0,
            end_col: 0,
        };

        Self {
            row_count,
            col_count,
            row_heights,
            col_widths,
            cell_properties,
            cells,
            selected_cell_range: Some(range),
        }
    }

    pub fn get_cells(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.cells).unwrap()
    }

    pub fn move_selected_cell(&mut self, direction: Direction) {
        if let Some(range) = &self.selected_cell_range {
            let new_range = match direction {
                Direction::UP => range.move_up(),
                Direction::DOWN => range.move_down(self.row_count),
                Direction::LEFT => range.move_left(),
                Direction::RIGHT => range.move_right(self.col_count),
            };

            self.selected_cell_range = Some(new_range);
        }
    }

    pub fn get_cell(&self) -> JsValue {
        if let Some(range) = &self.selected_cell_range {
            let mut y = 0;
            for r in 0..range.start_row {
                y += self.row_heights[r];
            }

            let mut x = 0;
            for c in 0..range.start_col {
                x += self.col_widths[c];
            }

            let cell = Cell {
                x,
                y,
                width: self.col_widths[range.start_col],
                height: self.row_heights[range.start_row],
            };
            serde_wasm_bindgen::to_value(&cell).unwrap()
        } else {
            JsValue::NULL
        }
    }

    fn draw_cells(
        row_count: usize,
        col_count: usize,
        // cell_properties: &Vec<Vec<CellProperty>>,
        row_heights: &Vec<usize>,
        col_widths: &Vec<usize>,
    ) -> Vec<Cell> {
        let mut cells = vec![];

        for row in 0..row_count {
            for col in 0..col_count {
                let cell = Self::draw_single_cell(row, col, row_heights, col_widths);
                cells.push(cell);
            }
        }

        cells
    }

    fn draw_single_cell(
        row: usize,
        col: usize,
        row_heights: &Vec<usize>,
        col_widths: &Vec<usize>,
    ) -> Cell {
        let mut y = 0;
        for r in 0..row {
            y += row_heights[r];
        }

        let mut x = 0;
        for c in 0..col {
            x += col_widths[c];
        }

        Cell {
            x,
            y,
            width: col_widths[col],
            height: row_heights[row],
        }
    }

    fn create_grid<T>(row_count: usize, col_count: usize, default_value: T) -> Vec<Vec<T>>
    where
        T: Clone,
    {
        vec![vec![default_value.clone(); row_count]; col_count]
    }
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Cell {
    pub x: usize,
    pub y: usize,
    pub width: usize,
    pub height: usize,
}

#[derive(Clone)]
enum TextAlign {
    Left,
}

#[wasm_bindgen]
pub enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

#[wasm_bindgen]
#[derive(Clone)]
struct CellProperty {
    text_align: TextAlign,
}

struct SelectedCellRange {
    start_row: usize,
    start_col: usize,
    end_row: usize,
    end_col: usize,
}

impl SelectedCellRange {
    fn move_up(&self) -> Self {
        let row = self.start_row.checked_sub(1).unwrap_or(0);
        let col = self.start_col;
        Self {
            start_row: row,
            start_col: col,
            end_row: row,
            end_col: col,
        }
    }

    fn move_left(&self) -> Self {
        let row = self.start_row;
        let col = self.start_col.checked_sub(1).unwrap_or(0);
        Self {
            start_row: row,
            start_col: col,
            end_row: row,
            end_col: col,
        }
    }

    fn move_down(&self, boundary: usize) -> Self {
        let row = (self.start_row + 1).min(boundary - 1);
        let col = self.start_col;
        Self {
            start_row: row,
            start_col: col,
            end_row: row,
            end_col: col,
        }
    }

    fn move_right(&self, boundary: usize) -> Self {
        let row = self.start_row;
        let col = (self.start_col + 1).min(boundary);
        Self {
            start_row: row,
            start_col: col,
            end_row: row,
            end_col: col,
        }
    }
}
