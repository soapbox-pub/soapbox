import { beforeEach, describe, expect, it } from 'vitest';

import { buildGroup, buildGroupRelationship } from 'soapbox/jest/factory.ts';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';
import { GroupRoles } from 'soapbox/schemas/group-member.ts';
import { Group } from 'soapbox/types/entities.ts';

import GroupRelationship from './group-relationship.tsx';

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