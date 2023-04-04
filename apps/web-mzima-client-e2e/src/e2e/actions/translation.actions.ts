import { Base, Material } from './index';

class TranslationsActions {
  ClickTranslationButton() {
    Base.checkExistElement('btn-settings-translation');
    Base.checkContainElement('btn-settings-translation', 'Add translation');
    Base.clickElement('btn-settings-translation');
    return this;
  }

  AddTranslation(languages: string[]) {
    Base.checkContainElement('lang-modal-title', 'Choose language for translation');
    for (const language of languages) {
      Base.checkField(`lang-${ language }`);
    }
    Material.closeModal('btn-lang-add', 'Add');
    return this;
  }

  SelectTranslation(language: string) {
    Base.checkExistElement('select_language');
    Base.clickElement('select_language');
    Base.checkContainAndClickSelector('mat-option', language);
    return this;
  }
}

export default new TranslationsActions();
