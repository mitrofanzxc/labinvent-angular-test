import { Component, inject, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Store } from "@ngrx/store";

import { FileUploadModule } from "primeng/fileupload";
import { DropdownModule } from "primeng/dropdown";
import { CheckboxModule } from "primeng/checkbox";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

import { ChartsComponent } from "./charts.component";

import { selectStatisticsData } from "../store/statistics/statistics.selectors";
import { loadStatistics } from "../store/statistics/statistics.actions";

@Component({
    selector: "app-statistics",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FileUploadModule,
        DropdownModule,
        CheckboxModule,
        ChartsComponent,
    ],
    template: `
        <p-fileUpload
            mode="basic"
            chooseLabel="Upload JSON"
            (onSelect)="onFileSelect($event)"
            accept=".json"
            maxFileSize="5000000"
        ></p-fileUpload>

        <div class="filters">
            <p-dropdown
                [options]="sortOptions"
                [formControl]="sortControl"
                placeholder="Sort by"
            ></p-dropdown>

            <p-checkbox [formControl]="hideMinValuesControl" label="Hide min values"></p-checkbox>
        </div>

        <app-charts [data]="filteredData()"></app-charts>
    `,
    styles: [
        `
            .filters {
                display: flex;
                gap: 20px;
                margin-top: 10px;
            }
        `,
    ],
})
export class StatisticsComponent {
    private store = inject(Store);
    private statisticsDataSignal = signal<{ category: string; value: number }[]>([]);

    statisticsData = computed(() => this.statisticsDataSignal());
    filteredData = computed(() => this.applyFilters());

    sortOptions = [
        { label: "Alphabetical (A-Z)", value: "asc" },
        { label: "Alphabetical (Z-A)", value: "desc" },
    ];

    sortControl = new FormControl("asc");
    hideMinValuesControl = new FormControl(false);

    constructor() {
        this.store.select(selectStatisticsData).subscribe((data) => {
            this.statisticsDataSignal.set(data);
        });

        // Подписка на изменения и обновление фильтрации
        this.sortControl.valueChanges.subscribe(() => this.applyFilters());
        this.hideMinValuesControl.valueChanges.subscribe(() => this.applyFilters());
    }

    onFileSelect(event: any) {
        const file = event?.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const jsonData = JSON.parse(reader.result as string);
                this.store.dispatch(loadStatistics({ data: jsonData }));
            } catch (error) {
                console.error("Invalid JSON format");
            }
        };

        reader.readAsText(file);
    }

    applyFilters() {
        let filtered = [...this.statisticsData()];

        if (this.hideMinValuesControl.value) {
            const minValue = Math.min(...filtered.map((d) => d.value));
            filtered = filtered.filter((d) => d.value > minValue);
        }

        if (this.sortControl.value === "asc") {
            filtered.sort((a, b) => a.category.localeCompare(b.category));
        } else if (this.sortControl.value === "desc") {
            filtered.sort((a, b) => b.category.localeCompare(a.category));
        }

        return filtered;
    }
}
