import { TerminologyCode, TerminologyEntry } from '../../terminology/Terminology';
import { ValueFilter } from './AttributeFilter/ValueFilter';
import { TimeRestriction } from '../TimeRestriction';
import { AttributeFilter } from './AttributeFilter/AttributeFilter';
import { CritGroupPosition } from '../../../modules/querybuilder/controller/CritGroupArranger';

// A Criterion is an atomic building block of a query. However, a Criterion itself is defined by
// a terminology code (system + version + code), operators and values.
export class Criterion {
  termCodes?: Array<TerminologyCode> = [];
  display?: string;
  entity?: boolean = false;
  optional?: boolean = false;
  valueFilters?: Array<ValueFilter> = [];
  attributeFilters?: Array<AttributeFilter> = [];
  children?: Array<TerminologyEntry> = [];
  isinvalid?: boolean = false;
  position?: CritGroupPosition;
  linkedCriteria?: Criterion[] = [];
  isLinked?: boolean = false;
  context?: TerminologyCode;
  criterionHash?: string;
  uniqueID?: string;
  timeRestriction?: TimeRestriction;
}
