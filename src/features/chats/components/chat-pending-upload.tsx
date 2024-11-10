import ProgressBar from 'soapbox/components/ui/progress-bar.tsx';

interface IChatPendingUpload {
  progress: number;
}

/** Displays a loading thumbnail for an upload in the chat composer. */
const ChatPendingUpload: React.FC<IChatPendingUpload> = ({ progress }) => {
  return (
    <div className='relative isolate inline-flex size-24 items-center justify-center overflow-hidden rounded-lg bg-gray-200 p-4 dark:bg-primary-900'>
      <ProgressBar progress={progress} size='sm' />
    </div>
  );
};

export default ChatPendingUpload;