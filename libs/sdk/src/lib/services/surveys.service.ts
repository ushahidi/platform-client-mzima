import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SurveyApiResponse, SurveyItem } from '../models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';

@Injectable({
  providedIn: 'root',
})
export class SurveysService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
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
