import Spinner from 'soapbox/components/ui/spinner.tsx';

/** Fullscreen loading indicator. */
const LoadingScreen: React.FC = () => {
  return (
    <div className='fixed h-screen w-screen'>
      <div className='d-screen fixed z-10 flex w-screen items-center justify-center'>
        <div className='p-4'>
          <Spinner size={40} withText={false} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
