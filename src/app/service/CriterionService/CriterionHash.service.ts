import { Injectable } from '@angular/core';
import { TerminologyCode } from '../../model/terminology/Terminology';

@Injectable({
  providedIn: 'root',
})
export class CriterionHashService {
  constructor() {}

  public createHash(context: TerminologyCode, termCode: TerminologyCode): string {
    const contextVersion = context.version ? context.version : '';
    const termcodeVersion = termCode.version ? termCode.version : '';
    const hashCode =
      context.system +
      context.code +
      contextVersion +
      termCode.system +
      termCode.code +
      termcodeVersion;
    return hashCode;
  }
}
