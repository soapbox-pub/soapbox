import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, defineMessages } from 'react-intl';
import Icon from 'soapbox/components/icon';

const messages = defineMessages({
  group_archived: { id: 'group.detail.archived_group', defaultMessage: 'Archived group' },
  group_admin: { id: 'groups.detail.role_admin', defaultMessage: 'You\'re an admin' },
});

const privacyIconMap = {
  public: 'globe-w',
  members_only: 'envelope',
};

export default @injectIntl
class GroupPanel extends ImmutablePureComponent {

    static propTypes = {
      group: ImmutablePropTypes.map,
      relationships: ImmutablePropTypes.map,
    }

    render() {
      const { group, relationships, intl } = this.props;
      const privacy = group.getIn(['source', 'privacy']);
      const icon = privacyIconMap[privacy] || '';

      return (
        <div className='group__panel'>
          <h1 className='group__panel__title'>
            {group.get('display_name')}
          </h1>

          {relationships && relationships.get('admin') && <span className='group__panel__label'>{intl.formatMessage(messages.group_admin)}</span>}

          <div className='group__panel__description'>
            <Icon id={icon} />
            {group.get('note')}
          </div>
        </div>
      );
    }

}
