import { useHistory, useLocation } from 'react-router-dom';

type History = ReturnType<typeof useHistory>;
type Location = ReturnType<typeof useLocation>;

export type {
  History,
  Location,
};