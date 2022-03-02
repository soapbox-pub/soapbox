export const getHost = instance => {
  try {
    return new URL(instance.uri).host;
  } catch {
    try {
      return new URL(`https://${instance.uri}`).host;
    } catch {
      return null;
    }
  }
};
