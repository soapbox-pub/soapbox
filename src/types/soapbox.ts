import {
  PromoPanelItemRecord,
  FooterItemRecord,
  CryptoAddressRecord,
  SoapboxConfigRecord,
} from 'soapbox/normalizers/soapbox/soapbox-config.ts';

type Me = string | null | false | undefined;

type PromoPanelItem = ReturnType<typeof PromoPanelItemRecord>;
type FooterItem = ReturnType<typeof FooterItemRecord>;
type CryptoAddress = ReturnType<typeof CryptoAddressRecord>;
type SoapboxConfig = ReturnType<typeof SoapboxConfigRecord>;

export type {
  Me,
  PromoPanelItem,
  FooterItem,
  CryptoAddress,
  SoapboxConfig,
};
