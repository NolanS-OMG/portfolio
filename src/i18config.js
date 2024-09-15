import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './config/en.json';
import esTranslations from './config/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
    },
    lng: navigator.language.split('-')[0], // Detecta el idioma del navegador, ej. 'es' o 'en'
    fallbackLng: 'en', // Idioma por defecto si no se encuentra el idioma detectado
    interpolation: {
      escapeValue: false, // React ya escapa el contenido de forma segura
    },
  });

export default i18n;
