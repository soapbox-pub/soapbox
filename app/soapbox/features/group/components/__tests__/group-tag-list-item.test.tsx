import React from 'react';

import { buildGroup, buildGroupTag, buildGroupRelationship } from 'soapbox/jest/factory';
import { render, screen } from 'soapbox/jest/test-helpers';
import { GroupRoles } from 'soapbox/schemas/group-member';

import GroupTagListItem from '../group-tag-list-item';

describe('<GroupTagListItem />', () => {
  describe('tag name', () => {
    const name = 'hello';

    it('should render the tag name', () => {
      const group = buildGroup();
      const tag = buildGroupTag({ name });
      render(<GroupTagListItem group={group} tag={tag} isPinnable />);

      expect(screen.getByTestId('group-tag-list-item')).toHaveTextContent(`#${name}`);
    });

    describe('when the tag is "visible"', () => {
      const group = buildGroup();
      const tag = buildGroupTag({ name, visible: true });

      it('renders the default name', () => {
        render(<GroupTagListItem group={group} tag={tag} isPinnable />);
        expect(screen.getByTestId('group-tag-name')).toHaveClass('text-gray-900');
      });
    });

    describe('when the tag is not "visible" and user is Owner', () => {
      const group = buildGroup({
        relationship: buildGroupRelationship({
          role: GroupRoles.OWNER,
          member: true,
        }),
      });
      const tag = buildGroupTag({
        name,
        visible: false,
      });

      it('renders the subtle name', () => {
        render(<GroupTagListItem group={group} tag={tag} isPinnable />);
        expect(screen.getByTestId('group-tag-name')).toHaveClass('text-gray-400');
      });
    });

    describe('when the tag is not "visible" and user is Admin or User', () => {
      const group = buildGroup({
        relationship: buildGroupRelationship({
          role: GroupRoles.ADMIN,
          member: true,
        }),
      });
      const tag = buildGroupTag({
        name,
        visible: false,
      });

      it('renders the subtle name', () => {
        render(<GroupTagListItem group={group} tag={tag} isPinnable />);
        expect(screen.getByTestId('group-tag-name')).toHaveClass('text-gray-900');
      });
    });
  });

  describe('pinning', () => {
    describe('as an owner', () => {
      const group = buildGroup({
        relationship: buildGroupRelationship({
          role: GroupRoles.OWNER,
          member: true,
        }),
      });

      describe('when the tag is visible', () => {
        const tag = buildGroupTag({ visible: true });

        it('renders the pin icon', () => {
          render(<GroupTagListItem group={group} tag={tag} isPinnable />);
          expect(screen.getByTestId('pin-icon')).toBeInTheDocument();
        });
      });

      describe('when the tag is not visible', () => {
        const tag = buildGroupTag({ visible: false });

        it('does not render the pin icon', () => {
          render(<GroupTagListItem group={group} tag={tag} isPinnable />);
          expect(screen.queryAllByTestId('pin-icon')).toHaveLength(0);
        });
      });
    });

    describe('as a non-owner', () => {
      const group = buildGroup({
        relationship: buildGroupRelationship({
          role: GroupRoles.ADMIN,
          member: true,
        }),
      });

      describe('when the tag is pinned', () => {
        const tag = buildGroupTag({ pinned: true, visible: true });

        it('does render the pin icon', () => {
          render(<GroupTagListItem group={group} tag={tag} isPinnable />);
          screen.debug();
          expect(screen.queryAllByTestId('pin-icon')).toHaveLength(1);
        });
      });

      describe('when the tag is not pinned', () => {
        const tag = buildGroupTag({ pinned: false, visible: true });

        it('does not render the pin icon', () => {
          render(<GroupTagListItem group={group} tag={tag} isPinnable />);
          expect(screen.queryAllByTestId('pin-icon')).toHaveLength(0);
        });
      });
    });
  });
});