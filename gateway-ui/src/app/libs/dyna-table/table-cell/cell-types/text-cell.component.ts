import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CellComponent } from './cell.component';
import { ColumnConfig } from '../../column-config.model';

@Component({
  selector: 'ngx-text-cell',
  template: '{{ column.cell(row) }}',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextCellComponent implements CellComponent {
  @Input() column: ColumnConfig;
  @Input() row: object;
}
