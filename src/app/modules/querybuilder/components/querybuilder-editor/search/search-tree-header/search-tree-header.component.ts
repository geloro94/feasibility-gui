import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CategoryEntry } from '../../../../model/api/terminology/terminology';

@Component({
  selector: 'num-search-tree-header',
  templateUrl: './search-tree-header.component.html',
  styleUrls: ['./search-tree-header.component.scss'],
})
export class SearchTreeHeaderComponent implements OnInit {
  @Input()
  selectedId: string;

  @Input()
  categories: Array<CategoryEntry> = [];

  @Output()
  switchCategory = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  fireSwitchCategory(event): void {
    this.categories.forEach((category) => {
      if (category.display === event.tab.textLabel) {
        console.log('it works');
        this.switchCategory.emit(category.catId);
      }
    });
  }
}
