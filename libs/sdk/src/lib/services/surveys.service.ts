import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
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
    return apiHelpers.API_V_5;
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

  getSurveys(url: string, params: object): Observable<SurveyApiResponse> {
    return super.get(url, params);
  }

  getSurveyById(id: string | number): Observable<any> {
    return super.getById(id);
  }

  deleteSurvey(id: string | number): Observable<any> {
    return super.delete(id);
  }

  public setToFilters(surveyId: number): void {
    const localStorageKey = 'USH_filters';
    const filters = localStorage.getItem(localStorageKey)!;
    const data = JSON.parse(filters);
    if (!data.form.includes(surveyId)) {
      data.form.push(surveyId);
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    }
  }

  public removeFromFilters(surveyId: number): void {
    const localStorageKey = 'USH_filters';
    const filters = localStorage.getItem(localStorageKey)!;
    const data = JSON.parse(filters);
    if (data.form.includes(surveyId)) {
      data.form = data.form.filter((item: number) => item !== surveyId);
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    }
  }
}
