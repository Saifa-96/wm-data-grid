use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct DataGrid {
    cur_row: usize,
    cur_col: usize,
    cell_properties: Vec<Vec<CellProperty>>,
    spreadsheet_data: Vec<Vec<String>>,
    selected_cell_range: Option<SelectedCellRange>,
    view_window: ViewWindow,
}

#[wasm_bindgen]
impl DataGrid {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Self {
        let row_count = 100;
        let col_count = 100;
        let col_widths = vec![100; col_count];

        let cell_properties = Self::create_grid(
            row_count,
            col_count,
            CellProperty {
                text_align: TextAlign::Left,
            },
        );

        let mut spreadsheet_data = Self::create_grid(row_count, col_count, String::new());

        for row in 0..row_count {
            for col in 0..col_count {
                if row == 0 && col > 0 {
                    let number: u32 = col.try_into().unwrap();
                    spreadsheet_data[row][col] = Self::number_to_column_name(number);
                } else if row > 0 && col == 0 {
                    spreadsheet_data[row][col] = row.to_string();
                }
            }
        }

        let range = SelectedCellRange {
            start_row: 0,
            start_col: 0,
            end_row: 0,
            end_col: 0,
        };

        let view_window = ViewWindow::new(width, height, row_count, col_count, col_widths, 26);

        Self {
            cur_row: 0,
            cur_col: 0,
            cell_properties,
            spreadsheet_data,
            selected_cell_range: Some(range),
            view_window,
        }
    }

    pub fn vertical_move(&mut self, step: isize) {
        self.view_window.vertical_move(step);
    }

    pub fn horizontal_move(&mut self, step: isize) {
        self.view_window.horizontal_move(step);
    }

    pub fn update_cell_data(&mut self, row: usize, col: usize, value: String) {
        self.spreadsheet_data[row][col] = value;
    }

    pub fn get_grid(&self) -> JsValue {
        let row_idx_vec = self.view_window.get_visible_row_idx_vec();
        let col_idx_vec = self.view_window.get_visible_col_idx_vec();

        let mut grid: Vec<Vec<Cell>> = vec![];
        for row_idx in row_idx_vec {
            let row_cells: Vec<Cell> = col_idx_vec
                .iter()
                .map(|&col_idx| Cell {
                    row: row_idx,
                    col: col_idx,
                })
                .collect();

            grid.push(row_cells);
        }
        serde_wasm_bindgen::to_value(&grid).unwrap()
    }

    pub fn get_spreadsheet_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.spreadsheet_data).unwrap()
    }

    fn number_to_column_name(mut number: u32) -> String {
        let mut column_name = String::new();

        while number > 0 {
            let remainder = (number - 1) % 26;
            let alphabet = char::from_u32(65 + remainder).unwrap();
            column_name.insert(0, alphabet);
            number = (number - 1) / 26;
        }

        column_name
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
    pub row: usize,
    pub col: usize,
}

#[derive(Clone)]
enum TextAlign {
    Left,
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
pub enum Direction {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3,
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

struct ViewWindow {
    width: usize,
    height: usize,
    row_count: usize,
    col_count: usize,
    col_widths: Vec<usize>,
    visible_row_count: usize,
    fixed_row: usize,
    fixed_col: usize,
    cur_row: usize,
    cur_col: usize,
}

impl ViewWindow {
    fn new(
        width: usize,
        height: usize,
        row_count: usize,
        col_count: usize,
        col_widths: Vec<usize>,
        row_height: usize,
    ) -> Self {
        let visible_row_count = (height / row_height) + 1;

        Self {
            width,
            height,
            row_count,
            col_count,
            col_widths,
            visible_row_count,
            fixed_row: 0,
            fixed_col: 0,
            cur_row: 1,
            cur_col: 1,
        }
    }

    fn vertical_move(&mut self, step: isize) {
        let row_idx = self.cur_row as isize;
        self.cur_row = (row_idx + step).try_into().unwrap_or(0).clamp(
            self.fixed_row + 1,
            self.row_count - self.visible_row_count + 2,
        );
    }

    fn horizontal_move(&mut self, step: isize) {
        let col_idx = self.cur_col as isize;
        self.cur_col = (col_idx + step)
            .try_into()
            .unwrap_or(0)
            .clamp(self.fixed_col + 1, self.col_count);
    }

    fn get_visible_row_idx_vec(&self) -> Vec<usize> {
        let row_idx = self.cur_row;
        let mut idx_vec = gen_vec(0, self.fixed_row + 1);
        let rest_idx_vec = gen_vec(
            row_idx,
            (self.visible_row_count - idx_vec.len()).min(self.row_count - row_idx),
        );
        idx_vec.extend(rest_idx_vec);
        idx_vec
    }

    fn get_visible_col_idx_vec(&self) -> Vec<usize> {
        let mut col_idx = self.cur_col;
        let mut visible_col_idx = gen_vec(0, self.fixed_col + 1);
        let mut content_width: usize = visible_col_idx.iter().fold(0, |acc, &idx| {
            let width = self.col_widths[idx];
            acc + width
        });

        while col_idx < self.col_count && content_width < self.width {
            content_width += self.col_widths[col_idx];
            visible_col_idx.push(col_idx);
            col_idx += 1;
        }

        visible_col_idx
    }
}

fn gen_vec(start: usize, length: usize) -> Vec<usize> {
    (0..length).map(|x| x + start).collect()
}
