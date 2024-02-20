import { Criterion } from 'src/app/model/FeasibilityQuery/Criterion/Criterion';
import { CriterionHashService } from './CriterionHash.service';
import { Injectable } from '@angular/core';
import { TerminologyCode, TerminologyEntry } from 'src/app/model/terminology/Terminology';
import { v4 as uuidv4 } from 'uuid';
import { UIProfile } from 'src/app/model/terminology/UIProfile';
import {
  AttributeDefinition,
  ValueDefinition,
} from 'src/app/model/terminology/AttributeDefinitions/AttributeDefinition';
import { ValueFilter } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/ValueFilter';
import { AttributeFilter } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { TimeRestriction } from 'src/app/model/FeasibilityQuery/TimeRestriction';
import { FeatureService } from '../Feature.service';
import { LoadUIProfileService } from '../LoadUIProfile.service';
import { Observable, Subject } from 'rxjs';
import { ObjectHelper } from '../../modules/querybuilder/controller/ObjectHelper';
import { CritGroupPosition } from '../../modules/querybuilder/controller/CritGroupArranger';

@Injectable({
  providedIn: 'root',
})
export class CreateCriterionService {
  constructor(
    private criterionHashService: CriterionHashService,
    private featureService: FeatureService,
    private UiProfileService: LoadUIProfileService
  ) {}

  public createCriterionFromTermCode(
    termCodes: TerminologyCode[],
    context: TerminologyCode
  ): Observable<Criterion> {
    const criterion: Criterion = new Criterion();
    const hash = this.criterionHashService.createHash(context, termCodes[0]);
    const subject = new Subject<Criterion>();
    console.log('criterion');
    console.log(ObjectHelper.clone(criterion));
    this.applyUIProfileToCriterion(hash).subscribe((critFromProfile) => {
      console.log('assign');
      console.log(critFromProfile);
      console.log(Object.assign(criterion, critFromProfile));

      Object.assign(criterion, critFromProfile);
      criterion.context = context;
      criterion.criterionHash = hash;
      criterion.display = termCodes[0].display;
      criterion.termCodes = this.copyTermCodes(termCodes);
      criterion.uniqueID = uuidv4();
      criterion.position = new CritGroupPosition();
      console.log('final');
      console.log(ObjectHelper.clone(criterion));
      subject.next(criterion);
    });
    //return of(criterion);
    return subject.asObservable();
  }
  public createReferenceCriterionFromTermCode(
    termCodes: TerminologyCode[],
    context: TerminologyCode
  ): Criterion {
    const criterion: Criterion = new Criterion();
    const hash = this.criterionHashService.createHash(context, termCodes[0]);

    criterion.context = context;
    criterion.criterionHash = hash;
    criterion.display = termCodes[0].display;
    criterion.uniqueID = uuidv4();
    criterion.termCodes = this.copyTermCodes(termCodes, criterion.uniqueID);
    criterion.isLinked = true;
    criterion.position = new CritGroupPosition();
    return criterion;
  }
  public createCriterionFromTermEntry(termEntry: TerminologyEntry): Criterion {
    const criterion: Criterion = new Criterion();
    criterion.children = termEntry.children;
    criterion.context = termEntry.context;
    criterion.display = termEntry.display;
    criterion.entity = termEntry.entity;
    criterion.optional = termEntry.optional;
    criterion.uniqueID = uuidv4();
    criterion.termCodes = this.copyTermCodes(termEntry.termCodes, criterion.uniqueID);
    criterion.position = new CritGroupPosition();
    criterion.criterionHash = this.criterionHashService.createHash(
      criterion.context,
      criterion.termCodes[0]
    );
    return criterion;
  }

  private copyTermCodes(termCodes: TerminologyCode[], uid?: string): TerminologyCode[] {
    const termCodeResult = new Array<TerminologyCode>();
    termCodes.forEach((termCode) => {
      if (uid) {
        termCode.uid = uid;
      }
      termCodeResult.push(termCode);
    });
    return termCodeResult;
  }

  private applyUIProfileToCriterion(hash: string): Observable<Criterion> {
    let criterion: Criterion;
    const subject = new Subject<Criterion>();
    this.UiProfileService.getUIProfile(hash).subscribe((profile) => {
      criterion = this.addUIProfileElementsToCriterion(profile);
      subject.next(criterion);
    });
    return subject.asObservable();
  }
  private addUIProfileElementsToCriterion(profile: UIProfile): Criterion {
    const criterion: Criterion = new Criterion();
    criterion.attributeFilters = this.getAttributeFilters(profile.attributeDefinitions);
    criterion.valueFilters[0] = this.getValueFilters(profile.valueDefinition);
    criterion.timeRestriction = this.addTimeRestriction(profile.timeRestrictionAllowed);
    return criterion;
  }

  private getValueFilters(valueDefinition: ValueDefinition): ValueFilter {
    const valueFilter = new ValueFilter();
    if (valueDefinition !== null) {
      valueFilter.maxValue = valueDefinition.max;
      valueFilter.minValue = valueDefinition.min;
      valueFilter.precision = valueDefinition.precision;
      valueFilter.optional = valueDefinition.optional;
      valueFilter.type = this.UiProfileService.setDefinitionType(valueDefinition.type);
      valueFilter.valueDefinition = this.UiProfileService.extractValueDefinition(valueDefinition);
    }
    return valueFilter;
  }

  private getAttributeFilters(attributeDefinitions: AttributeDefinition[]): AttributeFilter[] {
    const attributeFilter = this.UiProfileService.extractAttributeFilters(attributeDefinitions);
    return attributeFilter;
  }

  private addTimeRestriction(timeRestrictionAllowed: boolean): TimeRestriction | undefined {
    const useFeatureTimeRestrictions = this.featureService.useFeatureTimeRestriction();
    return timeRestrictionAllowed && useFeatureTimeRestrictions ? new TimeRestriction() : undefined;
  }
}
