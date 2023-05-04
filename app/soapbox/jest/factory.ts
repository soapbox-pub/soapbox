import { v4 as uuidv4 } from 'uuid';

import {
  adSchema,
  cardSchema,
  groupSchema,
  groupRelationshipSchema,
  groupTagSchema,
  relationshipSchema,
  type Ad,
  type Card,
  type Group,
  type GroupRelationship,
  type GroupTag,
  type Relationship,
} from 'soapbox/schemas';

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

function buildCard(props: Partial<Card> = {}): Card {
  return cardSchema.parse(Object.assign({
    url: 'https://soapbox.test',
  }, props));
}

function buildGroup(props: Partial<Group> = {}): Group {
  return groupSchema.parse(Object.assign({
    id: uuidv4(),
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

export {
  buildCard,
  buildGroup,
  buildGroupRelationship,
  buildGroupTag,
  buildAd,
  buildRelationship,
};