import { StructuredQueryCriterion } from '../StructuredQuery/CriterionSQ/StructuredQueryCriterion';

export class DataSelection {
  version = 'http://to_be_decided.com/draft-1/schema#';
  display: string;

  selectedCriteria: StructuredQueryCriterion[][] = [];
}
