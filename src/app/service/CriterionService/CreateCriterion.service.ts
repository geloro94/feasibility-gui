import { Criterion } from 'src/app/model/FeasibilityQuery/Criterion/Criterion';
import { CriterionHashService } from './CriterionHash.service';
import { Injectable } from '@angular/core';
import { TerminologyCode, TerminologyEntry } from 'src/app/model/terminology/Terminology';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CreateCriterionService {
  constructor(private criterionHashService: CriterionHashService) {}

  public createCriterionFromTermCode(): Criterion {
    const criterion: Criterion = new Criterion();
    return criterion;
  }

  public createCriterionFromTermEntry(termEntry: TerminologyEntry): Criterion {
    const criterion: Criterion = new Criterion();
    criterion.children = termEntry.children;
    criterion.context = termEntry.context;
    criterion.display = termEntry.display;
    criterion.entity = termEntry.entity;
    criterion.optional = termEntry.optional;
    criterion.termCodes = this.copyTermCodes(termEntry);
    criterion.uniqueID = uuidv4();
    criterion.criterionHash = this.criterionHashService.createHash(
      criterion.context,
      criterion.termCodes[0]
    );
    return criterion;
  }

  private copyTermCodes(termEntry: TerminologyEntry): TerminologyCode[] {
    const termCodes = new Array<TerminologyCode>();
    termEntry.termCodes?.forEach((termCode) => {
      termCodes.push(termCode);
    });
    return termCodes;
  }
}
