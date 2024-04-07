import { z } from 'zod';

const baseRuleSchema = z.object({
  id: z.string(),
  text: z.string().catch(''),
  hint: z.string().catch(''),
  rule_type: z.enum(['account', 'content', 'group']).nullable().catch(null),
});

const ruleSchema = z.preprocess((data: any) => {
  return {
    ...data,
    hint: data.hint || data.subtext,
  };
}, baseRuleSchema);

type Rule = z.infer<typeof ruleSchema>;

const adminRuleSchema = baseRuleSchema.extend({
  priority: z.number().nullable().catch(null),
});

type AdminRule = z.infer<typeof adminRuleSchema>;

export { ruleSchema, adminRuleSchema, type Rule, type AdminRule };