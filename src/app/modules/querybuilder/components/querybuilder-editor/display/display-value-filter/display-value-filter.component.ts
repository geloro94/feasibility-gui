import { Component, Input, OnInit } from '@angular/core';
import { Comparator, OperatorOptions, ValueFilter } from '../../../../model/api/query/valueFilter';
import { FeatureService } from '../../../../../../service/Feature.service';

class ComperatorIcon {
  icon: string;
  utf8: string;
}

@Component({
  selector: 'num-display-value-filter',
  templateUrl: './display-value-filter.component.html',
  styleUrls: ['./display-value-filter.component.scss'],
})
export class DisplayValueFilterComponent implements OnInit {
  @Input()
  filter: ValueFilter;
  OperatorOptions: typeof OperatorOptions = OperatorOptions;

  constructor(public featureService: FeatureService) {}

  ngOnInit(): void {}

  getComparator(): ComperatorIcon {
    let comparatorIcon: ComperatorIcon;

    switch (this.filter.comparator) {
      case Comparator.EQUAL: {
        comparatorIcon = { icon: 'equals', utf8: '\u003d' };
        break;
      }
      case Comparator.GREATER_THAN: {
        comparatorIcon = { icon: 'greater-than', utf8: '\u003e' };
        break;
      }
      case Comparator.GREATER_OR_EQUAL: {
        comparatorIcon = { icon: 'greater-than-equal', utf8: '\u2265' };
        break;
      }
      case Comparator.LESS_OR_EQUAL: {
        comparatorIcon = { icon: 'less-than-equal', utf8: '\u2264' };
        break;
      }
      case Comparator.LESS_THAN: {
        comparatorIcon = { icon: 'less-than', utf8: '\u003c' };
        break;
      }
      case Comparator.NOT_EQUAL: {
        comparatorIcon = { icon: 'not-equal', utf8: '\u2260' };
        break;
      }
      default: {
        comparatorIcon = { icon: '', utf8: '' };
        break;
      }
    }
    if (this.featureService.useFeatureShowDisplayValueFilterIcon()) {
      comparatorIcon.utf8 = '';
    }

    return comparatorIcon;
  }
}
