import { Component, Input, OnInit } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-circle-graph',
  templateUrl: './circle-graph.component.html',
  styleUrls: ['./circle-graph.component.scss'],
  standalone: true,
  imports: [NgxChartsModule],
})
export class CircleGraphComponent implements OnInit {
  @Input() width: number = 400;
  @Input() height: number = 400;
  @Input({ required: true }) data!: Array<{ name: string; value: number }>;
  @Input() showLegend: boolean = false;
  @Input() theme: Color;

  constructor() {
    this.theme = {
      domain: [
        '#2dd55b',
        '#57e389',
        '#6030ff',
        '#0054e9',
        '#ffc409',
        '#c5000f',
        '#f6f8fc',
        '#5f5f5f',
        '#2f2f2f',
      ],
      group: ScaleType.Linear,
      name: 'Testing',
      selectable: false,
    };
  }

  ngOnInit() {}
}
