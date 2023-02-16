import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ISafeEmbed {
  /** Styles for the outer frame element. */
  className?: string
  /** Space-separate list of restrictions to ALLOW for the iframe. */
  sandbox?: string
  /** Unique title for the iframe. */
  title: string
  /** HTML body to embed. */
  html?: string
}

/** Safely embeds arbitrary HTML content on the page (by putting it in an iframe). */
const SafeEmbed: React.FC<ISafeEmbed> = ({
  className,
  sandbox,
  title,
  html,
}) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'setHeight') {
      setHeight(e.data?.height);
    }
  }, []);

  useEffect(() => {
    const iframeDocument = iframe.current?.contentWindow?.document;

    if (iframeDocument && html) {
      iframeDocument.open();
      iframeDocument.write(html);
      iframeDocument.close();
      iframeDocument.body.style.margin = '0';

      iframe.current?.contentWindow?.addEventListener('message', handleMessage);

      const innerFrame = iframeDocument.querySelector('iframe');
      if (innerFrame) {
        innerFrame.width = '100%';
      }
    }

    return () => {
      iframe.current?.contentWindow?.removeEventListener('message', handleMessage);
    };
  }, [iframe.current, html]);

  return (
    <iframe
      ref={iframe}
      className={className}
      sandbox={sandbox}
      height={height}
      title={title}
    />
  );
};

export default SafeEmbed;
