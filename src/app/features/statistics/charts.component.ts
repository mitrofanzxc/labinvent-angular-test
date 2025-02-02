import {
    Component,
    Input,
    AfterViewInit,
    ElementRef,
    ViewChild,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as d3 from "d3";

@Component({
    selector: "app-charts",
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="charts">
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
                margin-top: 20px;
            }
            .chart {
                width: 400px;
                height: 400px;
            }
        `,
    ],
})
export class ChartsComponent implements AfterViewInit, OnChanges {
    @Input() data!: { category: string; value: number }[];

    @ViewChild("barChart", { static: false }) private barChartContainer!: ElementRef;
    @ViewChild("pieChart", { static: false }) private pieChartContainer!: ElementRef;

    ngAfterViewInit() {
        this.renderCharts();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["data"] && !changes["data"].firstChange) {
            this.renderCharts();
        }
    }

    private renderCharts() {
        if (!this.data || this.data.length === 0) return;

        this.renderBarChart();
        this.renderPieChart();
    }

    private renderBarChart() {
        if (!this.data || this.data.length === 0) return;
        const element = this.barChartContainer.nativeElement;
        d3.select(element).selectAll("*").remove();

        const width = 400,
            height = 400,
            margin = { top: 20, right: 20, bottom: 40, left: 50 };

        const svg = d3
            .select(element)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3
            .scaleBand()
            .domain(this.data.map((d) => d.category))
            .range([0, width - margin.left - margin.right])
            .padding(0.2);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(this.data, (d) => d.value) || 100])
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        // Add Axes
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g").call(d3.axisLeft(y));

        // Tooltip
        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("display", "none");

        // Bars
        svg.selectAll(".bar")
            .data(this.data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d.category)!)
            .attr("y", (d) => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - margin.top - margin.bottom - y(d.value))
            .attr("fill", "steelblue")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("display", "block")
                    .html(`Category: ${d.category}<br>Value: ${d.value}`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
            });
    }

    private renderPieChart() {
        if (!this.data || this.data.length === 0) return;
        const element = this.pieChartContainer.nativeElement;
        d3.select(element).selectAll("*").remove();

        const width = 400,
            height = 400,
            radius = Math.min(width, height) / 2;

        const svg = d3
            .select(element)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pie = d3.pie<{ category: string; value: number }>().value((d) => d.value);
        const arc = d3
            .arc<d3.PieArcDatum<{ category: string; value: number }>>()
            .innerRadius(0)
            .outerRadius(radius);

        // Tooltip
        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("display", "none");

        svg.selectAll("path")
            .data(pie(this.data))
            .enter()
            .append("path")
            .attr("d", arc as any)
            .attr("fill", (d) => color(d.data.category)!)
            .on("mouseover", (event, d) => {
                tooltip
                    .style("display", "block")
                    .html(`Category: ${d.data.category}<br>Value: ${d.data.value}`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
            });
    }
}
