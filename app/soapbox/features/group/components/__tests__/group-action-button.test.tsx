import React from 'react';

import { buildGroup, buildGroupRelationship } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';
import { Group } from 'soapbox/types/entities';

import GroupActionButton from '../group-action-button';

let group: Group;

describe('<GroupActionButton />', () => {
  describe('with no group relationship', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: null,
      });
    });

    describe('with a private group', () => {
      beforeEach(() => {
        group = { ...group, locked: true };
      });

      it('should render the Request Access button', () => {
        render(<GroupActionButton group={group} />);

        expect(screen.getByRole('button')).toHaveTextContent('Request Access');
      });
    });

    describe('with a public group', () => {
      beforeEach(() => {
        group = { ...group, locked: false };
      });

      it('should render the Join Group button', () => {
        render(<GroupActionButton group={group} />);

        expect(screen.getByRole('button')).toHaveTextContent('Join Group');
      });
    });
  });

  describe('with no group relationship member', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          member: null,
        }),
      });
    });

    describe('with a private group', () => {
      beforeEach(() => {
        group = { ...group, locked: true };
      });

      it('should render the Request Access button', () => {
        render(<GroupActionButton group={group} />);

        expect(screen.getByRole('button')).toHaveTextContent('Request Access');
      });
    });

    describe('with a public group', () => {
      beforeEach(() => {
        group = { ...group, locked: false };
      });

      it('should render the Join Group button', () => {
        render(<GroupActionButton group={group} />);

        expect(screen.getByRole('button')).toHaveTextContent('Join Group');
      });
    });
  });

  describe('when the user has requested to join', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: true,
          member: true,
        }),
      });
    });

    it('should render the Cancel Request button', () => {
      render(<GroupActionButton group={group} />);

      expect(screen.getByRole('button')).toHaveTextContent('Cancel Request');
    });
  });

  describe('when the user is an Admin', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: 'admin',
        }),
      });
    });

    it('should render the Manage Group button', () => {
      render(<GroupActionButton group={group} />);

      expect(screen.getByRole('button')).toHaveTextContent('Manage Group');
    });
  });

  describe('when the user is just a member', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: 'user',
        }),
      });
    });

    it('should render the Leave Group button', () => {
      render(<GroupActionButton group={group} />);

      expect(screen.getByRole('button')).toHaveTextContent('Leave Group');
    });
  });
});