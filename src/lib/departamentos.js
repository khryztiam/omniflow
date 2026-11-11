export const normalizarLocales = (localIds) => {
  if (!Array.isArray(localIds) || localIds.some((id) => typeof id !== 'string')) {
    return null;
  }

  return [...new Set(localIds.map((id) => id.trim()).filter(Boolean))];
};
