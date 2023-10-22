import { Component, OnInit } from '@angular/core';
import { CriterionService } from './criterion.service';
import { Criterion } from 'src/app/modules/querybuilder/model/api/query/criterion';

@Component({
  selector: 'num-criterion',
  templateUrl: './criterion.component.html',
  styleUrls: ['./criterion.component.scss'],
})
export class CriterionComponent implements OnInit {
  criterions: Criterion[] = [];

  constructor(private criterionService: CriterionService) {}

  ngOnInit(): void {
    this.criterions = this.criterionService.getCriterions();
  }
}
