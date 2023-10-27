import { TerminologyCode } from '../terminology/terminology';
import { Criterion } from './criterion';
import { AttributeFilters } from './attributeFilters';
import { AttributeDefinition } from '../terminology/attributeDefinition';

export class AttributeFilter extends AttributeFilters {
  attributeCode: TerminologyCode;
  criteria?: Criterion[];
  attributeDefinition?: AttributeDefinition;
}
