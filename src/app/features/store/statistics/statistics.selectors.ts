import { createSelector, createFeatureSelector } from "@ngrx/store";
import { StatisticsState } from "./statistics.reducer";

export const selectStatisticsState = createFeatureSelector<StatisticsState>("statistics");

export const selectStatisticsData = createSelector(selectStatisticsState, (state) => state.data);
