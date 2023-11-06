import { ValueDefinition } from '../../../terminology/AttributeDefinitions/AttributeDefinition';
import { AbstractAttributeFilters } from './AbstractAttributeFilters';

export class ValueFilter extends AbstractAttributeFilters {
  valueDefinition: ValueDefinition = null;
}
