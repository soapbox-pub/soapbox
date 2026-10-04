import { type MRFSimple, mrfSimpleSchema } from '@/schemas/pleroma.ts';

export interface ConfigTuple {
  tuple: [string, any];
}

export interface Config {
  group: string;
  key: string;
  value: any;
  [key: string]: unknown;
}

export type Policy = Record<string, any>;

const find = (
  configs: readonly Config[],
  group: string,
  key: string,
): Config | undefined => {
  return configs.find(config => config.group === group && config.key === key);
};

/** Find the value of a `{ tuple: [key, value] }` entry in a config value list. */
const findTupleValue = (values: unknown, key: string): unknown => {
  if (!Array.isArray(values)) return undefined;
  const entry = values.find((value: ConfigTuple) => value?.tuple?.[0] === key);
  return entry ? entry.tuple[1] : undefined;
};

const toSimplePolicy = (configs: readonly Config[]): MRFSimple => {
  const config = find(configs, ':pleroma', ':mrf_simple');

  if (config && Array.isArray(config.value)) {
    const result = (config.value as ConfigTuple[]).reduce<Record<string, string[]>>((acc, curr) => {
      const key = curr.tuple[0];
      const hosts = curr.tuple[1] as string[];
      acc[key.replace(/^:/, '')] = [...new Set(hosts)];
      return acc;
    }, {});

    return mrfSimpleSchema.parse(result);
  } else {
    return mrfSimpleSchema.parse({});
  }
};

const fromSimplePolicy = (simplePolicy: Policy): Config[] => {
  const value = Object.entries(simplePolicy).map(([key, hosts]) => ({ tuple: [`:${key}`, hosts] }));

  return [
    {
      group: ':pleroma',
      key: ':mrf_simple',
      value,
    },
  ];
};

export const ConfigDB = {
  find,
  findTupleValue,
  toSimplePolicy,
  fromSimplePolicy,
};

export default ConfigDB;
