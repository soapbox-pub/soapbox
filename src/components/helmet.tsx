import React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet';

import { useReports } from 'soapbox/api/hooks/admin';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useAppSelector, useInstance, useSettings } from 'soapbox/hooks';
import { RootState } from 'soapbox/store';
import FaviconService from 'soapbox/utils/favicon-service';

FaviconService.initFaviconService();

const getNotifTotals = (state: RootState): number => {
  const notifications = state.notifications.unread || 0;
  const approvals = state.admin.awaitingApproval.count();
  return notifications + approvals;
};

interface IHelmet {
  children: React.ReactNode;
}

const Helmet: React.FC<IHelmet> = ({ children }) => {
  useReports({ resolved: false });
  const instance = useInstance();
  const { unreadChatsCount, openReportsCount } = useStatContext();
  const unreadCount = useAppSelector((state) => getNotifTotals(state) + unreadChatsCount + openReportsCount);
  const { demetricator } = useSettings();

  const hasUnreadNotifications = React.useMemo(() => !(unreadCount < 1 || demetricator), [unreadCount, demetricator]);

  const addCounter = (string: string) => {
    return hasUnreadNotifications ? `(${unreadCount}) ${string}` : string;
  };

  const updateFaviconBadge = () => {
    if (hasUnreadNotifications) {
      FaviconService.drawFaviconBadge();
    } else {
      FaviconService.clearFaviconBadge();
    }
  };

  React.useEffect(() => {
    updateFaviconBadge();
  }, [unreadCount, demetricator]);

  return (
    <ReactHelmet
      titleTemplate={addCounter(`%s | ${instance.title}`)}
      defaultTitle={addCounter(instance.title)}
      defer={false}
    >
      {children}
    </ReactHelmet>
  );
};

export default Helmet;
