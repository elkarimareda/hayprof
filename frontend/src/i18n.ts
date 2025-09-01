import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import I18NextHttpBackend from "i18next-http-backend";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detects user language
  .use(I18NextHttpBackend) // loads translations from your server
  .init({
    fallbackLng: "en", // language to use if translations in user language are not available
    debug: true, // set to false in production
    detection: {
      order: ["localStorage", "navigator"], // Check localStorage first
      caches: ["localStorage"], // Cache in localStorage
    },
    backend: {
      loadPath: (lngs: string[]) => {
        const language = lngs[0].split("-")[0]; // Get the base language code (e.g., "en" from "en-US")
        return `/locales/${language}/{{ns}}.json`; // Path to your translation files
      },
    },
    defaultNS: "translation", // default namespace used if not specified
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
