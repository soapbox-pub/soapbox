
/**
 * IntentionalError:
 * For testing logging/monitoring & previewing ErrorBoundary design.
 */
const IntentionalError: React.FC = () => {
  throw new Error('This error is intentional.');
};

export default IntentionalError;
