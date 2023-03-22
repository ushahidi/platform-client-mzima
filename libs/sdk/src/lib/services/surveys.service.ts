import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvLoader } from '../loader';
import { SurveyApiResponse, SurveyItem } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class SurveysService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return 'api/v5/';
  }

  getResourceUrl(): string {
    return 'surveys';
  }

  saveSurvey(survey: SurveyItem, surveyId?: string) {
    if (surveyId) {
      return super.update(surveyId, survey);
    } else {
      return super.post(survey);
    }
  }

  getSurveys(): Observable<SurveyApiResponse> {
    return super.get();
  }

  getSurveyById(id: string | number): Observable<any> {
    return super.getById(id);
  }

  deleteSurvey(id: string | number): Observable<any> {
    return super.delete(id);
  }
}
