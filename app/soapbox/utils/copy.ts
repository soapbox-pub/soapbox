const copy = (text: string, onSuccess?: () => void) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);

    if (onSuccess) {
      onSuccess();
    }
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

      if (onSuccess) {
        onSuccess();
      }
    }
  }
};

export default copy;
