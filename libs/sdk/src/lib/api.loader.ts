import { Observable, of } from 'rxjs';
import { apiHelpers } from './helpers';
import { EnvLoader } from './loader';

export class ApiUrlLoader implements EnvLoader {
  constructor(private envService: any) {}

  /**
   * Gets the API url from env file
   */
  public getApiUrl(): Observable<string> {
    if (typeof this.envService.environment?.backend_url === 'string') {
      return of(this.envService.environment.backend_url);
    } else {
      return of(apiHelpers.getApiUrlByDomain(this.envService.environment.backend_url));
    }
  }
}
