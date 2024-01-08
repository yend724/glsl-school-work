export const getQueryParameters = () => {
  const url = window.location.search;
  const params = new URLSearchParams(url);
  const obj: { [key: string]: string } = {};
  for (const [key, value] of params) {
    3;
    obj[key] = value;
  }
  return obj;
};
