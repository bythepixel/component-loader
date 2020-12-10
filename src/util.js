export function id() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}${s4()}`;
}


export function isValidSelector(selector) {
  if (!selector) return false;
  const queryCheck = s => document.createDocumentFragment().querySelector(s);
  try {
    queryCheck(selector);
  } catch {
    return false;
  }
  return true;
}
