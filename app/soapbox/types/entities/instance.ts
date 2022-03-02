type Instance = Immutable<{
  uri: string,
  title: string,
  short_description: string,
  feature_quote: boolean,
  description: string,
  version: string,
  description_limit: number,
  configuration: {
    statuses: {
      max_characters: number,
      max_media_attachments: number,
    },
    polls: {
      max_options: number,
      max_characters_per_option: number,
      min_expiration: number,
      max_expiration: number,
    },
  },
  pleroma: {
    metadata: {
      features: Array<string>,
      federation: {
        enabled: boolean,
      },
    },
  },
}>
