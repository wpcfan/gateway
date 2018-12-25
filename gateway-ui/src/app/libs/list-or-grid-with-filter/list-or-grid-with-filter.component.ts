import {
  Component,
  ViewChild,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { MatButtonToggleGroup } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

export interface Item {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
}

@Component({
  selector: 'ngx-list-or-grid-with-filter',
  templateUrl: './list-or-grid-with-filter.component.html',
  styleUrls: ['./list-or-grid-with-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListOrGridWithFilterComponent {
  @Input() items: Item[] = [];
  @Input() filterPlaceholder = '';
  @Input() showAdd = false;
  @Input() userServerFilter = false;
  @Output() select = new EventEmitter();
  @Output() add = new EventEmitter();
  @Output() filter = new EventEmitter();
  filterValue = null;
  selection = new SelectionModel<Partial<Item>>(false, []);
  @ViewChild('gridView')
  public gridView: MatButtonToggleGroup;
  constructor() {}

  handleSelected(item: Item) {
    this.select.emit(item);
  }

  handleAdd() {
    this.add.emit();
  }

  handleFilter() {
    this.filter.emit(this.filterValue);
  }

  public get filteredItems(): Item[] {
    return this.userServerFilter
      ? this.items
      : this.filterValue
      ? this.items.filter(
          item =>
            item.title.includes(this.filterValue) ||
            item.subtitle.includes(this.filterValue)
        )
      : this.items;
  }
}
