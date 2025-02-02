import { Component, inject, computed, signal } from "@angular/core";
import { Store } from "@ngrx/store";
import { CommonModule } from "@angular/common";
import { FileUploadModule } from "primeng/fileupload";
import { ChartsComponent } from "./charts.component";
import { selectStatisticsData } from "../store/statistics/statistics.selectors";
import { loadStatistics } from "../store/statistics/statistics.actions";

@Component({
    selector: "app-statistics",
    standalone: true,
    imports: [CommonModule, FileUploadModule, ChartsComponent],
    template: `
        <p-fileUpload
            mode="basic"
            chooseLabel="Upload JSON"
            (onSelect)="onFileSelect($event)"
            accept=".json"
            maxFileSize="5000000"
        ></p-fileUpload>

        <app-charts [data]="statisticsData()"></app-charts>
    `,
})
export class StatisticsComponent {
    private store = inject(Store);
    private statisticsDataSignal = signal<{ category: string; value: number }[]>([]);

    statisticsData = computed(() => this.statisticsDataSignal());

    constructor() {
        this.store.select(selectStatisticsData).subscribe((data) => {
            this.statisticsDataSignal.set(data);
        });
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
}
