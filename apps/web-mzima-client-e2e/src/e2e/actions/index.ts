import baseActions from './base.actions';
import loginActions from './auth/login.actions';
import settingsActions from './settings/settings.actions';
import SurveysActions from './settings/surveys.actions';
import TranslationsActions from './translation.actions';
import MaterialActions from './material.actions';

export const Base = baseActions;
export const Login = loginActions;
export const Settings = settingsActions;
export const Surveys = SurveysActions;
export const Translations = TranslationsActions;
export const Material = MaterialActions;
