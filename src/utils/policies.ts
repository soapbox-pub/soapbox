// Define the state type
export type PolicyState = {
  policies: PolicySpecItem[];
  fields: Record<string, PolicyParam>;
};

// Define action types
export type PolicyAction =
  | { type: 'ADD_POLICY'; policy: PolicySpecItem }
  | { type: 'REMOVE_POLICY'; name: string }
  | { type: 'UPDATE_FIELD'; policyName: string; fieldName: string; value: PolicyParam }
  | { type: 'ADD_MULTI_VALUE'; policyName: string; fieldName: string; value: string | number }
  | { type: 'REMOVE_MULTI_VALUE'; policyName: string; fieldName: string; value: string | number }
  | { type: 'INITIALIZE_FIELDS'; fields: Record<string, PolicyParam> };

type FieldType = 'string' | 'multi_string' | 'number' | 'multi_number' | 'boolean' | 'unknown';

export interface FieldItem {
  type: FieldType;
  description?: string;
  optional?: boolean;
  default?: any;
}

export interface PolicyItem {
  internalName: string;
  name: string;
  description?: string;
  parameters: Record<string, FieldItem>;
}

type ParamValue = string | number | boolean;
export type PolicyParam = ParamValue | (string | number)[];
export type PolicyParams = Record<string, PolicyParam>;

export interface PolicySpecItem {
  name: string;
  params?: PolicyParams;
}

export interface PolicySpec {
  policies: PolicySpecItem[];
}

export interface PolicyResponse {
  spec: PolicySpec;
}

export const stringifyDefault = (value: any) => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }
  if (['number', 'string', 'boolean'].includes(typeof value)) return value.toString();
  return '';
};
