import { v4 as uuidv4 } from 'uuid';

import {
  accountSchema,
  adSchema,
  cardSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  groupTagSchema,
  relationshipSchema,
  statusSchema,
  type Account,
  type Ad,
  type Card,
  type Group,
  type GroupMember,
  type GroupRelationship,
  type GroupTag,
  type Relationship,
  type Status,
} from 'soapbox/schemas';
import { GroupRoles } from 'soapbox/schemas/group-member';

import type { PartialDeep } from 'type-fest';

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

function buildAccount(props: PartialDeep<Account> = {}): Account {
  return accountSchema.parse(Object.assign({
    id: uuidv4(),
    url: `https://soapbox.test/users/${uuidv4()}`,
  }, props));
}

function buildCard(props: PartialDeep<Card> = {}): Card {
  return cardSchema.parse(Object.assign({
    url: 'https://soapbox.test',
  }, props));
}

function buildGroup(props: PartialDeep<Group> = {}): Group {
  return groupSchema.parse(Object.assign({
    id: uuidv4(),
    owner: {
      id: uuidv4(),
    },
  }, props));
}

function buildGroupRelationship(props: PartialDeep<GroupRelationship> = {}): GroupRelationship {
  return groupRelationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildGroupTag(props: PartialDeep<GroupTag> = {}): GroupTag {
  return groupTagSchema.parse(Object.assign({
    id: uuidv4(),
    name: uuidv4(),
  }, props));
}

function buildGroupMember(
  props: PartialDeep<GroupMember> = {},
  accountProps: PartialDeep<Account> = {},
): GroupMember {
  return groupMemberSchema.parse(Object.assign({
    id: uuidv4(),
    account: buildAccount(accountProps),
    role: GroupRoles.USER,
  }, props));
}

function buildAd(props: PartialDeep<Ad> = {}): Ad {
  return adSchema.parse(Object.assign({
    card: buildCard(),
  }, props));
}

function buildRelationship(props: PartialDeep<Relationship> = {}): Relationship {
  return relationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildStatus(props: PartialDeep<Status> = {}) {
  return statusSchema.parse(Object.assign({
    id: uuidv4(),
    account: buildAccount(),
  }, props));
}

export {
  buildAccount,
  buildAd,
  buildCard,
  buildGroup,
  buildGroupMember,
  buildGroupRelationship,
  buildGroupTag,
  buildRelationship,
  buildStatus,
};