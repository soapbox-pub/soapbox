/** Download the file from the response instead of opening it in a tab. */
// https://stackoverflow.com/a/53230807
export const download = (data: string, filename: string): void => {
  const url = URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
