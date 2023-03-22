import { Observable, of } from 'rxjs';
import { apiHelpers } from './helpers';
import { EnvLoader } from './loader';

export class ApiUrlLoader implements EnvLoader {
  constructor(private envService: any) {}

  /**
   * Gets the translations from the server
   */
  public getApiUrl(): Observable<string> {
    console.log('this.envService', this.envService);
    return this.envService.environment.backend_url
      ? of(this.envService.environment.backend_url)
      : of(apiHelpers.defaultApiURl);
  }
}
