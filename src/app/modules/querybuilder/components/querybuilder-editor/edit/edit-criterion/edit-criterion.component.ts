import { AttributeFilter } from '../../../../../../model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { BackendService } from '../../../../service/backend.service';
import { Criterion } from 'src/app/model/FeasibilityQuery/Criterion/Criterion';
import { CritGroupArranger, CritGroupPosition } from '../../../../controller/CritGroupArranger';
import { EditValueFilterComponent } from '../edit-value-filter/edit-value-filter.component';
import { FeatureService } from '../../../../../../service/Feature.service';
import { FilterTypes } from '../../../../../../model/FilterTypes';
import { ObjectHelper } from '../../../../controller/ObjectHelper';
import { Query } from 'src/app/model/FeasibilityQuery/Query';
import { QueryProviderService } from '../../../../service/query-provider.service';
import { Subscription } from 'rxjs';
import { TermEntry2CriterionTranslator } from 'src/app/modules/querybuilder/controller/TermEntry2CriterionTranslator';
import { TerminologyCode, TerminologyEntry } from 'src/app/model/terminology/Terminology';
import { ValueFilter } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/ValueFilter';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { TimeRestriction } from 'src/app/model/FeasibilityQuery/TimeRestriction';
import { TermEntry2CriterionTranslatorService } from 'src/app/service/TermEntry2CriterionTranslator.service';
import { CreateCriterionService } from 'src/app/service/CriterionService/CreateCriterion.service';
import { CriterionHashService } from 'src/app/service/CriterionService/CriterionHash.service';
import { QueryService } from 'src/app/service/QueryService.service';
@Component({
  selector: 'num-edit-criterion',
  templateUrl: './edit-criterion.component.html',
  styleUrls: ['./edit-criterion.component.scss'],
})
export class EditCriterionComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input()
  searchType: string;

  @Input()
  criterion: Criterion;

  @Input()
  query: Query;

  @Input()
  position: CritGroupPosition;

  @Input()
  actionButtonKey: string;

  @Output()
  save = new EventEmitter<{ groupId: number }>();

  @Output()
  discard = new EventEmitter<void>();

  @ViewChildren(EditValueFilterComponent) valueFilterComponents: QueryList<EditValueFilterComponent>;

  actionDisabled = true;

  singleReference: Criterion;

  selectedGroupId: number;

  showGroups: boolean;

  conceptAttributeFilters: Array<AttributeFilter> = [];

  referenceAttributeFilters: Array<AttributeFilter> = [];

  valueFilters: Array<ValueFilter> = [];

  preExistingReferenceCriterions: Array<Criterion> = [];

  private subscriptionCritProfile: Subscription;

  queryCriterionList: Array<Criterion> = [];
  queryCriteriaHashes: Array<string> = [];
  optionalCriteria: Array<Criterion> = [];
  private readonly translator;

  constructor(
    public termEntryService: TermEntry2CriterionTranslatorService,
    public createCriterionService: CreateCriterionService,
    public criterionHashService: CriterionHashService,
    public featureService: FeatureService,
    private changeDetector: ChangeDetectorRef,
    public provider: QueryProviderService,
    private backend: BackendService,
    private queryService: QueryService
  ) {
    this.translator = new TermEntry2CriterionTranslator(
      this.featureService.useFeatureTimeRestriction(),
      this.featureService.getQueryVersion()
    );
  }

  ngOnInit(): void {
    if (this.position) {
      this.selectedGroupId = this.position.groupId;
    } else {
      this.selectedGroupId = this.query.groups[0].id;
    }

    this.showGroups = this.query.groups.length > 1;
    this.createListOfQueryCriteriaAndHashes();
    this.getAttributeFilters();
    this.getValueFilters();
  }

  ngOnDestroy(): void {
    this.subscriptionCritProfile?.unsubscribe();
  }

  ngAfterViewChecked(): void {
    this.actionDisabled = this.isActionDisabled();
    this.changeDetector.detectChanges();
  }

  createListOfQueryCriteriaAndHashes(): void {
    for (const inex of ['inclusion', 'exclusion']) {
      this.query.groups[0][inex + 'Criteria'].forEach((andGroup) => {
        andGroup.forEach((criterion) => {
          this.queryCriterionList.push(criterion);
          this.queryCriteriaHashes.push(criterion.criterionHash);
        });
      });
    }
    this.loadAllowedCriteria();
  }

  getValueFilters() {
    if (
      (this.criterion.valueFilters[0]?.valueDefinition !== null &&
        this.criterion.valueFilters[0]?.valueDefinition.selectableConcepts.length > 0) ||
      this.criterion.valueFilters[0]?.valueDefinition.allowedUnits
    ) {
      if (!this.featureService.useFeatureMultipleValueDefinitions()) {
        this.valueFilters[0] = this.criterion.valueFilters[0];
      }
      this.valueFilters = this.criterion.valueFilters;
    }
  }

  getAttributeFilters(): void {
    this.criterion.attributeFilters?.map((attributeFilter) => {
      const attributeFilterType = attributeFilter.attributeDefinition.type;
      if (attributeFilterType === FilterTypes.CONCEPT) {
        this.conceptAttributeFilters.push(attributeFilter);
      }
      if (
        attributeFilterType === FilterTypes.REFERENCE &&
        attributeFilter.attributeDefinition.selectableConcepts.length > 0 &&
        !attributeFilter.attributeDefinition.referencedOnlyOnce
      ) {
        this.referenceAttributeFilters.push(attributeFilter);
      }

      if (
        attributeFilterType === FilterTypes.REFERENCE &&
        attributeFilter.attributeDefinition.referencedOnlyOnce
      ) {
        this.referenceAttributeFilters.push(attributeFilter);
      }
    });
  }

  loadAllowedCriteria(): void {
    this.criterion.attributeFilters?.forEach((attrFilter) => {
      const refValSet = attrFilter.attributeDefinition.referenceCriteriaSet;
      if (refValSet) {
        this.subscriptionCritProfile = this.backend
          .getAllowedReferencedCriteria(refValSet, this.queryCriteriaHashes)
          .subscribe((allowedCriteriaList) => {
            attrFilter.attributeDefinition.selectableConcepts = [];
            if (allowedCriteriaList.length > 0) {
              attrFilter.type = FilterTypes.REFERENCE;
              allowedCriteriaList.forEach((critHash) => {
                this.findCriterionByHash(critHash).forEach((crit) => {
                  if (!this.isCriterionLinked(crit.uniqueID)) {
                    const termCodeUid: TerminologyCode = crit.termCodes[0];
                    termCodeUid.uid = crit.uniqueID;
                    attrFilter.attributeDefinition.selectableConcepts.push(termCodeUid);
                    this.preExistingReferenceCriterions.push(crit);
                  }
                });
              });
            }
          });
      }
    });
  }

  findCriterionByHash(hash: string): Criterion[] {
    const tempCrit: Criterion[] = [];
    for (const inex of ['inclusion', 'exclusion']) {
      this.query.groups[0][inex + 'Criteria'].forEach((disj) => {
        disj.forEach((conj) => {
          if (conj.criterionHash === hash) {
            tempCrit.push(conj);
          }
        });
      });
    }
    return tempCrit;
  }

  doSave(): void {
    if (this.isActionDisabled()) {
      return;
    }
    this.moveBetweenGroups();
    this.moveReferenceCriteria();
    this.provider.store(this.query);
    this.queryService.setFeasibilityQuery(this.query);
    this.save.emit({ groupId: this.selectedGroupId });
  }

  doDiscard(): void {
    this.discard.emit();
  }

  resetTimeRestriction() {
    this.criterion.timeRestriction = new TimeRestriction();
  }

  isActionDisabled(): boolean {
    const addibleTemp =
      !this.valueFilterComponents ||
      !!this.valueFilterComponents.find((filterComponent) => filterComponent.isActionDisabled());
    return addibleTemp;
  }

  moveBetweenGroups(): void {
    if (!this.position || this.position.groupId === this.selectedGroupId) {
      return;
    }

    if (!ObjectHelper.isNumber(this.position.row) || !ObjectHelper.isNumber(this.position.column)) {
      return;
    }

    this.query.groups = CritGroupArranger.moveCriterionToEndOfGroup(
      this.query.groups,
      this.position,
      {
        groupId: this.selectedGroupId,
        critType: this.position.critType,
        column: -1,
        row: -1,
      }
    );
  }

  moveReferenceCriteria(): void {
    for (const inex of ['inclusion', 'exclusion']) {
      let x = 0;
      this.query.groups[0][inex + 'Criteria'].forEach((disj) => {
        let y = 0;
        disj.forEach((conj) => {
          if (conj.isLinked) {
            this.query.groups = CritGroupArranger.moveCriterionToEndOfGroup(
              this.query.groups,
              {
                groupId: conj.position.groupId,
                critType: conj.position.critType,
                column: conj.position.column - y,
                row: conj.position.row - x,
              },
              {
                groupId: conj.position.groupId,
                critType: conj.position.critType,
                column: -1,
                row: -1,
              }
            );
            if (disj.length === 1) {
              x++;
            }
            if (disj.length > 1) {
              y++;
            }
            this.rePosition();
          }
        });
      });
    }
  }
  rePosition(): void {
    for (const inex of ['inclusion', 'exclusion']) {
      this.query.groups[0][inex + 'Criteria'].forEach((disj, i) => {
        disj.forEach((conj, j) => {
          conj.position.row = i;
          conj.position.column = j;
        });
      });
    }
  }
  isCriterionLinked(uid: string): boolean {
    let isLinked = false;

    for (const inex of ['inclusion', 'exclusion']) {
      this.query.groups[0][inex + 'Criteria'].forEach((disj) => {
        disj.forEach((conj) => {
          if (conj.linkedCriteria.length > 0) {
            conj.linkedCriteria.forEach((criterion) => {
              if (criterion.uniqueID === uid && conj.uniqueID !== this.criterion.uniqueID) {
                isLinked = true;
              }
            });
          }
        });
      });
    }

    return isLinked;
  }
}
