import { v4 as uuidv4 } from 'uuid';

import { normalizeStatus } from 'soapbox/normalizers';
import {
  accountSchema,
  adSchema,
  cardSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  groupTagSchema,
  relationshipSchema,
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

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

function buildAccount(props: Partial<Account> = {}): Account {
  return accountSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildCard(props: Partial<Card> = {}): Card {
  return cardSchema.parse(Object.assign({
    url: 'https://soapbox.test',
  }, props));
}

function buildGroup(props: Partial<Group> = {}): Group {
  return groupSchema.parse(Object.assign({
    id: uuidv4(),
    owner: {
      id: uuidv4(),
    },
  }, props));
}

function buildGroupRelationship(props: Partial<GroupRelationship> = {}): GroupRelationship {
  return groupRelationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildGroupTag(props: Partial<GroupTag> = {}): GroupTag {
  return groupTagSchema.parse(Object.assign({
    id: uuidv4(),
    name: uuidv4(),
  }, props));
}

function buildGroupMember(
  props: Partial<GroupMember> = {},
  accountProps: Partial<Account> = {},
): GroupMember {
  return groupMemberSchema.parse(Object.assign({
    id: uuidv4(),
    account: buildAccount(accountProps),
    role: GroupRoles.USER,
  }, props));
}

function buildAd(props: Partial<Ad> = {}): Ad {
  return adSchema.parse(Object.assign({
    card: buildCard(),
  }, props));
}

function buildRelationship(props: Partial<Relationship> = {}): Relationship {
  return relationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildStatus(props: Partial<Status> = {}) {
  return normalizeStatus(Object.assign({
    id: uuidv4(),
  }, props));
}

export {
  buildAd,
  buildCard,
  buildGroup,
  buildGroupMember,
  buildGroupRelationship,
  buildGroupTag,
  buildRelationship,
  buildStatus,
};