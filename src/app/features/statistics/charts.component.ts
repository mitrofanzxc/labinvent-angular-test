import {
    Component,
    Input,
    AfterViewInit,
    ElementRef,
    ViewChild,
    computed,
    signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as d3 from "d3";

@Component({
    selector: "app-charts",
    standalone: true,
    imports: [CommonModule],
    template: `
        <div #chartContainer class="charts">
            <div class="chart" #barChart></div>
            <div class="chart" #pieChart></div>
        </div>
    `,
    styles: [
        `
            .charts {
                display: flex;
                gap: 20px;
                justify-content: center;
                align-items: center;
            }
            .chart {
                width: 400px;
                height: 400px;
            }
        `,
    ],
})
export class ChartsComponent implements AfterViewInit {
    @Input() data!: { category: string; value: number }[];

    @ViewChild("barChart") private barChartContainer!: ElementRef;
    @ViewChild("pieChart") private pieChartContainer!: ElementRef;

    ngAfterViewInit() {
        this.renderBarChart();
        this.renderPieChart();
    }

    ngOnChanges() {
        if (this.barChartContainer) this.renderBarChart();
        if (this.pieChartContainer) this.renderPieChart();
    }

    private renderBarChart() {
        if (!this.data || this.data.length === 0) return;
        const element = this.barChartContainer.nativeElement;
        d3.select(element).selectAll("*").remove();

        const svg = d3.select(element).append("svg").attr("width", 400).attr("height", 400);

        const x = d3
            .scaleBand()
            .domain(this.data.map((d) => d.category))
            .range([0, 400])
            .padding(0.2);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(this.data, (d) => d.value)!])
            .range([400, 0]);

        svg.selectAll(".bar")
            .data(this.data)
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.category)!)
            .attr("y", (d) => y(d.value)!)
            .attr("width", x.bandwidth())
            .attr("height", (d) => 400 - y(d.value)!)
            .attr("fill", "steelblue")
            .append("title")
            .text((d) => `${d.category}: ${d.value}`);
    }

    private renderPieChart() {
        if (!this.data || this.data.length === 0) return;
        const element = this.pieChartContainer.nativeElement;
        d3.select(element).selectAll("*").remove();

        const svg = d3
            .select(element)
            .append("svg")
            .attr("width", 400)
            .attr("height", 400)
            .append("g")
            .attr("transform", "translate(200,200)");

        const pie = d3.pie<{ category: string; value: number }>().value((d) => d.value);
        const arc = d3
            .arc<d3.PieArcDatum<{ category: string; value: number }>>()
            .innerRadius(0)
            .outerRadius(200);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        svg.selectAll("path")
            .data(pie(this.data))
            .enter()
            .append("path")
            .attr("d", arc as any)
            .attr("fill", (d) => color(d.data.category)!)
            .append("title")
            .text((d) => `${d.data.category}: ${d.data.value}`);
    }
}
