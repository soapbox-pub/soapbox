import { isEqual } from 'es-toolkit';
import { useReducer, useRef, useEffect, useMemo } from 'react';

import { PolicyItem, PolicyParam, PolicySpecItem } from 'soapbox/utils/policies.ts';

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

// Reducer function
export const createPolicyReducer = (allPolicies: PolicyItem[]) => (state: PolicyState, action: PolicyAction): PolicyState => {
  switch (action.type) {
    case 'ADD_POLICY': {
      if (state.policies.some(p => p.name === action.policy.name)) {
        return state; // Don't add duplicate
      }

      // Initialize fields for the new policy
      const newFields = { ...state.fields };
      const policyDef = allPolicies.find(p => p.internalName === action.policy.name);

      if (policyDef) {
        Object.entries(policyDef.parameters).forEach(([fieldName, schema]) => {
          const fieldKey = `${action.policy.name}.${fieldName}`;
          if (!newFields[fieldKey]) {
            newFields[fieldKey] = schema.type.startsWith('multi_') ? [] : (schema.default ?? '');
          }
        });
      }

      return {
        ...state,
        policies: [action.policy, ...state.policies],
        fields: newFields,
      };
    }
    case 'REMOVE_POLICY':
      return {
        ...state,
        policies: state.policies.filter(policy => policy.name !== action.name),
      };
    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: {
          ...state.fields,
          [`${action.policyName}.${action.fieldName}`]: action.value,
        },
      };
    case 'ADD_MULTI_VALUE': {
      const fieldKey = `${action.policyName}.${action.fieldName}`;
      const current = (state.fields[fieldKey] as (string | number)[]) || [];
      const policyDef = allPolicies.find(p => p.internalName === action.policyName);
      const paramSchema = policyDef?.parameters[action.fieldName];
      const value = paramSchema?.type === 'multi_number' && typeof action.value === 'string'
        ? Number(action.value)
        : action.value;

      return {
        ...state,
        fields: {
          ...state.fields,
          [fieldKey]: [...current, value],
        },
      };
    }
    case 'REMOVE_MULTI_VALUE': {
      const fieldKey = `${action.policyName}.${action.fieldName}`;
      const current = (state.fields[fieldKey] as (string | number)[]) || [];
      return {
        ...state,
        fields: {
          ...state.fields,
          [fieldKey]: current.filter(v => v !== action.value),
        },
      };
    }
    case 'INITIALIZE_FIELDS':
      return {
        ...state,
        fields: action.fields,
      };
    default:
      return state;
  }
};

// Custom hook to initialize the reducer
export const usePolicyReducer = (allPolicies: PolicyItem[], initialPolicies: PolicySpecItem[], initialFields: Record<string, PolicyParam>) => {
  const policyReducer = useMemo(() => createPolicyReducer(allPolicies), [allPolicies]);
  const [state, dispatch] = useReducer(policyReducer, { policies: initialPolicies, fields: initialFields });

  const prevInitialFields = useRef<Record<string, PolicyParam>>();

  useEffect(() => {
    if (initialFields && !isEqual(prevInitialFields.current, initialFields)) {
      dispatch({ type: 'INITIALIZE_FIELDS', fields: initialFields });
      prevInitialFields.current = initialFields;
    }
  }, [initialFields]);

  return [state, dispatch] as const;
};
