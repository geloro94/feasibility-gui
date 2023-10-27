import { Injectable } from '@angular/core';
import { FeatureService } from './feature.service';

@Injectable({
  providedIn: 'root',
})
export class QueryTranslatorService {
  constructor(public featureService: FeatureService) {}
}
