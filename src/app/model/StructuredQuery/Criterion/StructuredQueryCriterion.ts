import { TerminologyCode } from '../../terminology/Terminology';
import { AbstractTimeRestriction } from './AttributeFilters/QueryFilters/TimeRestriction/AbstractTimeRestriction';
import { StructuredQueryAttributeFilters } from './AttributeFilters/StructuredQueryAttributeFilters';
import { StructuredQueryValueFilters } from './AttributeFilters/StructuredQueryValueFilters';

/**
 * @todo we need default values for all class attributes
 */
export class StructuredQueryCriterion {
  attributeFilters?: Array<StructuredQueryAttributeFilters>;
  context?: TerminologyCode;
  timeRestriction?: AbstractTimeRestriction;
  termCodes: Array<TerminologyCode> = [];
  valueFilters?: Array<StructuredQueryValueFilters>;
}
