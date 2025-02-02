import { createAction, props } from "@ngrx/store";

export const loadStatistics = createAction(
    "[Statistics] Load Data",
    props<{ data: { category: string; value: number }[] }>()
);

export const resetStatistics = createAction("[Statistics] Reset Data");
