import { Component, Input, OnInit } from '@angular/core';
import { ValueFilter } from 'src/app/modules/querybuilder/model/api/query/valueFilter';
import { TerminologyCode } from 'src/app/modules/querybuilder/model/api/terminology/terminology';

@Component({
  selector: 'num-concept',
  templateUrl: './concept.component.html',
  styleUrls: ['./concept.component.scss'],
})
export class ConceptComponent implements OnInit {
  @Input()
  selectedConcepts: Array<TerminologyCode>;

  ngOnInit() {}
}
