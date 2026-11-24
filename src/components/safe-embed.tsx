import { useEffect, useMemo, useRef, useState } from 'react';

interface ISafeEmbed {
  /** Styles for the outer frame element. */
  className?: string;
  /**
   * Space-separated list of restrictions to ALLOW for the iframe.
   * `allow-same-origin` is always removed: combined with `allow-scripts` it would let the
   * embedded HTML run as this page.
   */
  sandbox?: string;
  /** Unique title for the iframe. */
  title: string;
  /** HTML body to embed. */
  html?: string;
}

/**
 * Script added to the embedded document to report its height to this page.
 * Embeds like Mastodon's `embed.js` also post `setHeight` messages from an inner iframe;
 * those are forwarded too. The frame has an opaque origin, so this is the only way to
 * learn its size.
 */
const HEIGHT_SCRIPT = `<script>
(function () {
  function post(height) {
    parent.postMessage({ type: 'setHeight', height: height }, '*');
  }
  function measure() {
    post(document.documentElement.scrollHeight);
  }
  addEventListener('message', function (e) {
    if (e.data && e.data.type === 'setHeight') setTimeout(measure, 0);
  });
  addEventListener('load', measure);
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(measure).observe(document.documentElement);
  }
})();
</script>`;

const BASE_STYLE = '<style>body{margin:0}iframe{width:100%}</style>';

/** Safely embeds arbitrary HTML content on the page (in a sandboxed iframe with its own origin). */
const SafeEmbed: React.FC<ISafeEmbed> = ({
  className,
  sandbox = '',
  title,
  html,
}) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const sandboxFlags = useMemo(() => {
    return sandbox
      .split(/\s+/)
      .filter((flag) => flag && flag.toLowerCase() !== 'allow-same-origin')
      .join(' ');
  }, [sandbox]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Only trust messages from our own frame.
      if (!iframe.current || e.source !== iframe.current.contentWindow) return;
      if (e.data?.type === 'setHeight' && typeof e.data.height === 'number' && Number.isFinite(e.data.height)) {
        setHeight(Math.max(0, Math.min(e.data.height, 10000)));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!html) return null;

  return (
    <iframe
      ref={iframe}
      className={className}
      sandbox={sandboxFlags}
      srcDoc={BASE_STYLE + html + HEIGHT_SCRIPT}
      height={height}
      title={title}
    />
  );
};

export default SafeEmbed;
