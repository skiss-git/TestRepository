import './vendor/i18n.shims.js';
import I18n from './vendor/i18n.js';
import AppTranslations from './app_translations.js';
import RailsTranslations from './rails_translations.js';
import _ from 'underscore';

I18n.translations = _.extend(RailsTranslations, AppTranslations);
export default I18n;
