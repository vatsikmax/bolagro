import "server-only";

const dictionaries = {
  ua: () => import("../messages/ua.json").then((module) => module.default),
  ru: () => import("../messages/ru.json").then((module) => module.default),
  ro: () => import("../messages/ro.json").then((module) => module.default),
  en: () => import("../messages/en.json").then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'ua' | 'ro' | 'ru') => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries.en();
};