import { TerminologyCode } from './terminology';
import { AttributeDefinitions } from './attributeDefinitions';

export class AttributeDefinition extends AttributeDefinitions {
  attributeCode: TerminologyCode;
  referenceCriteriaSet: string;
}
export class ValueDefinition extends AttributeDefinitions {}
