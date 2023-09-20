import userEvent from '@testing-library/user-event';
import React from 'react';

import { __stub } from 'soapbox/api';
import { buildGroup, buildGroupMember, buildGroupRelationship } from 'soapbox/jest/factory';
import { render, screen, waitFor } from 'soapbox/jest/test-helpers';
import { GroupRoles } from 'soapbox/schemas/group-member';

import GroupMemberListItem from '../group-member-list-item';

describe('<GroupMemberListItem />', () => {
  describe('account rendering', () => {
    const accountId = '4';
    const groupMember = buildGroupMember({}, {
      id: accountId,
      display_name: 'tiger woods',
    });

    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
      });
    });

    it('should render the users avatar', async () => {
      const group = buildGroup({
        relationship: buildGroupRelationship(),
      });

      render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

      await waitFor(() => {
        expect(screen.getByTestId('group-member-list-item')).toHaveTextContent(groupMember.account.display_name);
      });
    });
  });

  describe('role badge', () => {
    const accountId = '4';
    const group = buildGroup();

    describe('when the user is an Owner', () => {
      const groupMember = buildGroupMember({ role: GroupRoles.OWNER }, {
        id: accountId,
        display_name: 'tiger woods',
      });

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      it('should render the correct badge', async () => {
        render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

        await waitFor(() => {
          expect(screen.getByTestId('role-badge')).toHaveTextContent('owner');
        });
      });
    });

    describe('when the user is an Admin', () => {
      const groupMember = buildGroupMember({ role: GroupRoles.ADMIN }, {
        id: accountId,
        display_name: 'tiger woods',
      });

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      it('should render the correct badge', async () => {
        render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

        await waitFor(() => {
          expect(screen.getByTestId('role-badge')).toHaveTextContent('admin');
        });
      });
    });

    describe('when the user is an User', () => {
      const groupMember = buildGroupMember({ role: GroupRoles.USER }, {
        id: accountId,
        display_name: 'tiger woods',
      });

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      it('should render no correct badge', async () => {
        render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

        await waitFor(() => {
          expect(screen.queryAllByTestId('role-badge')).toHaveLength(0);
        });
      });
    });
  });

  describe('as a Group owner', () => {
    const group = buildGroup({
      relationship: buildGroupRelationship({
        role: GroupRoles.OWNER,
        member: true,
      }),
    });

    describe('when the user has role of "user"', () => {
      const accountId = '4';
      const groupMember = buildGroupMember({}, {
        id: accountId,
        display_name: 'tiger woods',
        username: 'tiger',
      });

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      describe('when "canPromoteToAdmin is true', () => {
        it('should render dropdown with correct Owner actions', async () => {
          const user = userEvent.setup();

          render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

          await waitFor(async() => {
            await user.click(screen.getByTestId('icon-button'));
          });

          const dropdownMenu = screen.getByTestId('dropdown-menu');
          expect(dropdownMenu).toHaveTextContent('Assign admin role');
          expect(dropdownMenu).toHaveTextContent('Kick @tiger from group');
          expect(dropdownMenu).toHaveTextContent('Ban from group');
        });
      });

      describe('when "canPromoteToAdmin is false', () => {
        it('should prevent promoting user to Admin', async () => {
          const user = userEvent.setup();

          render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin={false} />);

          await waitFor(async() => {
            await user.click(screen.getByTestId('icon-button'));
            await user.click(screen.getByTitle('Assign admin role'));
          });

          expect(screen.getByTestId('toast')).toHaveTextContent('Admin limit reached');
        });
      });
    });

    describe('when the user has role of "admin"', () => {
      const accountId = '4';
      const groupMember = buildGroupMember(
        {
          role: GroupRoles.ADMIN,
        },
        {
          id: accountId,
          display_name: 'tiger woods',
          username: 'tiger',
        },
      );

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      it('should render dropdown with correct Owner actions', async () => {
        const user = userEvent.setup();

        render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

        await waitFor(async() => {
          await user.click(screen.getByTestId('icon-button'));
        });

        const dropdownMenu = screen.getByTestId('dropdown-menu');
        expect(dropdownMenu).toHaveTextContent('Remove admin role');
        expect(dropdownMenu).toHaveTextContent('Kick @tiger from group');
        expect(dropdownMenu).toHaveTextContent('Ban from group');
      });
    });
  });

  describe('as a Group admin', () => {
    const group = buildGroup({
      relationship: buildGroupRelationship({
        role: GroupRoles.ADMIN,
        member: true,
      }),
    });

    describe('when the user has role of "user"', () => {
      const accountId = '4';
      const groupMember = buildGroupMember({}, {
        id: accountId,
        display_name: 'tiger woods',
        username: 'tiger',
      });

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      it('should render dropdown with correct Admin actions', async () => {
        const user = userEvent.setup();

        render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

        await waitFor(async() => {
          await user.click(screen.getByTestId('icon-button'));
        });

        const dropdownMenu = screen.getByTestId('dropdown-menu');
        expect(dropdownMenu).not.toHaveTextContent('Assign admin role');
        expect(dropdownMenu).toHaveTextContent('Kick @tiger from group');
        expect(dropdownMenu).toHaveTextContent('Ban from group');
      });
    });

    describe('when the user has role of "admin"', () => {
      const accountId = '4';
      const groupMember = buildGroupMember(
        {
          role: GroupRoles.ADMIN,
        },
        {
          id: accountId,
          display_name: 'tiger woods',
          username: 'tiger',
        },
      );

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      it('should not render the dropdown', async () => {
        render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

        await waitFor(async() => {
          expect(screen.queryAllByTestId('icon-button')).toHaveLength(0);
        });
      });
    });

    describe('when the user has role of "owner"', () => {
      const accountId = '4';
      const groupMember = buildGroupMember(
        {
          role: GroupRoles.OWNER,
        },
        {
          id: accountId,
          display_name: 'tiger woods',
          username: 'tiger',
        },
      );

      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
        });
      });

      it('should not render the dropdown', async () => {
        render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

        await waitFor(async() => {
          expect(screen.queryAllByTestId('icon-button')).toHaveLength(0);
        });
      });
    });
  });

  describe('as a Group user', () => {
    const group = buildGroup({
      relationship: buildGroupRelationship({
        role: GroupRoles.USER,
        member: true,
      }),
    });
    const accountId = '4';
    const groupMember = buildGroupMember({}, {
      id: accountId,
      display_name: 'tiger woods',
      username: 'tiger',
    });

    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/accounts/${accountId}`).reply(200, groupMember.account);
      });
    });

    it('should not render the dropdown', async () => {
      render(<GroupMemberListItem group={group} member={groupMember} canPromoteToAdmin />);

      await waitFor(async() => {
        expect(screen.queryAllByTestId('icon-button')).toHaveLength(0);
      });
    });
  });
});