const copy = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');

    textarea.textContent    = text;
    textarea.style.position = 'fixed';

    document.body.appendChild(textarea);

    try {
      textarea.select();
      document.execCommand('copy');
    } catch {
    // Do nothing
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export default copy;
