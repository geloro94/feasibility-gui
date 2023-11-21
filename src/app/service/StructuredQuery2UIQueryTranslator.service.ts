import { Injectable } from '@angular/core';
import { StructuredQuery } from '../model/StructuredQuery/StructuredQuery';
import { Query } from '../model/FeasibilityQuery/Query';
import { StructuredQueryTemplate } from '../model/StructuredQuery/StructuredQueryTemplate';

@Injectable({
  providedIn: 'root',
})
export class StructuredQuery2UIQueryTranslator {
  constructor() {}

  public translateImportedSQtoUIQuery(uiquery: Query, sqquery: StructuredQuery): Query {
    const invalidCriteria = [];
    const inclusion = sqquery.inclusionCriteria ? sqquery.inclusionCriteria : [];
    uiquery.groups[0].inclusionCriteria = this.translateSQtoUICriteria(inclusion, invalidCriteria);
    const exclusion = sqquery.exclusionCriteria ? sqquery.exclusionCriteria : [];
    uiquery.groups[0].exclusionCriteria = this.translateSQtoUICriteria(exclusion, invalidCriteria);
    uiquery.consent = this.hasConsentAndIfSoDeleteIt(sqquery);
    //uiquery = this.rePosition(uiquery);
    return uiquery;
  }

  public translateSQtoUIQuery(uiquery: Query, sqquery: StructuredQueryTemplate): Query {
    const invalidCriteria = sqquery.invalidTerms;
    const inclusion = sqquery.content.inclusionCriteria ? sqquery.content.inclusionCriteria : [];
    uiquery.groups[0].inclusionCriteria = this.translateSQtoUICriteria(inclusion, invalidCriteria);
    const exclusion = sqquery.content.exclusionCriteria ? sqquery.content.exclusionCriteria : [];
    uiquery.groups[0].exclusionCriteria = this.translateSQtoUICriteria(exclusion, invalidCriteria);
    uiquery.consent = this.hasConsentAndIfSoDeleteIt(sqquery.content);
    //uiquery = this.rePosition(uiquery);
    return uiquery;
  }
}
