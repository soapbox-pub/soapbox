
import Input from '../input/input';

interface DatetimeProps {
  value: Date;
  onChange(date: Date): void;
  min?: Date;
  max?: Date;
  placeholder?: string;
  required?: boolean;
}

/**
 * Date input with time.
 */
export const Datetime: React.FC<DatetimeProps> = ({ value, onChange, min, max, ...rest }) => {
  return (
    <Input
      type='datetime-local'
      onChange={(e) => onChange(new Date(e.target.value))}
      value={formatDateLocal(value)}
      min={min ? formatDateLocal(min) : undefined}
      max={max ? formatDateLocal(max) : undefined}
      {...rest}
    />
  );
};

/** Format a Date object to 'YYYY-MM-DDTHH:MM' format, used by `<input type="datetime-local">` elements. */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}