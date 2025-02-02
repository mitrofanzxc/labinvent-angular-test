import { createReducer, on } from "@ngrx/store";
import * as StatisticsActions from "./statistics.actions";

export interface StatisticsState {
    data: { category: string; value: number }[];
}

const initialState: StatisticsState = {
    data: [],
};

export const statisticsReducer = createReducer(
    initialState,
    on(StatisticsActions.loadStatistics, (state, { data }) => ({ ...state, data })),
    on(StatisticsActions.resetStatistics, () => initialState)
);
