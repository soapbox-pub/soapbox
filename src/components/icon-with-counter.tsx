import { IIcon } from 'soapbox/components/icon.tsx';
import Counter from 'soapbox/components/ui/counter.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';

interface IIconWithCounter extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  countMax?: number;
  icon?: string;
  src?: string;
}

const IconWithCounter: React.FC<IIconWithCounter> = ({ icon, count, countMax, ...rest }) => {
  return (
    <div className='relative'>
      <Icon id={icon} {...rest as IIcon} />

      {count > 0 && (
        <span className='absolute -right-3 -top-2'>
          <Counter count={count} countMax={countMax} />
        </span>
      )}
    </div>
  );
};

export default IconWithCounter;
