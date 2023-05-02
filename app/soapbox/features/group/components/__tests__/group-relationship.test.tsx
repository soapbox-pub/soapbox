import React from 'react';

import { buildGroup, buildGroupRelationship } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';
import { GroupRoles } from 'soapbox/schemas/group-member';
import { Group } from 'soapbox/types/entities';

import GroupRelationship from '../group-relationship';

let group: Group;

describe('<GroupRelationship />', () => {
  describe('when the user is an admin', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: GroupRoles.ADMIN,
        }),
      });
    });

    it('should render the relationship', () => {
      render(<GroupRelationship group={group} />);

      expect(screen.getByTestId('group-relationship')).toHaveTextContent('Admin');
    });
  });

  describe('when the user is an owner', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: GroupRoles.OWNER,
        }),
      });
    });

    it('should render the relationship', () => {
      render(<GroupRelationship group={group} />);

      expect(screen.getByTestId('group-relationship')).toHaveTextContent('Owner');
    });
  });

  describe('when the user is a member', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: GroupRoles.USER,
        }),
      });
    });

    it('should render null', () => {
      render(<GroupRelationship group={group} />);

      expect(screen.queryAllByTestId('group-relationship')).toHaveLength(0);
    });
  });
});