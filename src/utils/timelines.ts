import type { Status } from '@/types/entities.ts';

interface ColumnSettings {
  shows?: Partial<Record<'reblog' | 'reply' | 'direct', boolean>>;
}

export const shouldFilter = (
  status: Pick<Status, 'in_reply_to_id' | 'visibility'> & { reblog: unknown },
  columnSettings: ColumnSettings | undefined,
) => {
  const shows = {
    reblog: status.reblog !== null,
    reply: status.in_reply_to_id !== null,
    direct: status.visibility === 'direct',
  };

  return Object.entries(shows).some(([key, value]) => {
    return columnSettings?.shows?.[key as keyof typeof shows] === false && value;
  });
};
