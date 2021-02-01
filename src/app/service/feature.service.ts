import { Injectable, isDevMode } from '@angular/core'
import { AppConfigService } from '../config/app-config.service'

@Injectable({
  providedIn: 'root',
})
export class FeatureService {
  constructor(private appConfig: AppConfigService) {}

  public useV2(): boolean {
    return this.appConfig.getConfig().features.v2.active
  }

  public isDevelopMode(): boolean {
    return isDevMode()
  }

  public mockTerminology(): boolean {
    return this.appConfig.getConfig().mock.terminology && this.isDevelopMode()
  }

  public mockQuery(): boolean {
    return this.appConfig.getConfig().mock.query && this.isDevelopMode()
  }

  public mockResult(): boolean {
    return this.appConfig.getConfig().mock.result && this.isDevelopMode()
  }
}
