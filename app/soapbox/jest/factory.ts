import { v4 as uuidv4 } from 'uuid';

import {
  groupSchema,
  groupRelationshipSchema,
  groupTagSchema,
  type Group,
  type GroupRelationship,
  type GroupTag,
} from 'soapbox/schemas';

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

function buildGroup(props: Record<string, any> = {}): Group {
  return groupSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildGroupRelationship(props: Record<string, any> = {}): GroupRelationship {
  return groupRelationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildGroupTag(props: Record<string, any> = {}): GroupTag {
  return groupTagSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

export { buildGroup, buildGroupRelationship, buildGroupTag };