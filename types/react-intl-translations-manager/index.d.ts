declare module 'react-intl-translations-manager' {
  import type { MessageDescriptor } from 'react-intl';

  export interface ExtractedDescriptor extends Omit<MessageDescriptor, 'defaultMessage'> {
    variables: Set<any>
    descriptors?: ExtractedDescriptor[]
    defaultMessage: string
  }

  export interface ExtractedMessage {
    path: string
    descriptors: ExtractedDescriptor[]
  }

  export interface ManageTranslationsConfig {
    /**
     * Directory where the babel plugin puts the extracted messages. This path is relative to your projects root.
     *
     * example: `src/locales/extractedMessages`
     */
    messagesDirectory: string
    /**
     * Directory of the translation files the translation manager needs to maintain.
     *
     * example: `src/locales/lang`
     */
    translationsDirectory: string
    /**
     * Directory of the whitelist files the translation manager needs to maintain. These files contain the key of translations that have the exact same text in a specific language as the defaultMessage. Specifying this key will suppress `unmaintained translation` warnings.
     *
     * example: `Dashboard` in english is also accepted as a valid translation for dutch.
     *
     * (optional, default: `translationsDirectory`)
     */
    whitelistsDirectory?: string
    /**
     * What languages the translation manager needs to maintain. Specifying no languages actually doesn't make sense, but won't break the translationManager either. (Please do not include the default language, react-intl will automatically include it.)
     *
     * example: for `['nl', 'fr']` the translation manager will maintain a `nl.json`, `fr.json`, `whitelist_nl.json` and a w`hitelist_fr.json` file
     *
     * (optional, default: `[]`)
     */
    languages?: string[]
    /**
     * Option to output a single JSON file containing the aggregate of all extracted messages, grouped by the file they were extracted from.
     *
     * example:
     *
     * ```json
     * [
     *   {
     *     "path": "src/components/foo.json",
     *     "descriptors": [
     *       {
     *         "id": "bar",
     *         "description": "Text for bar",
     *         "defaultMessage": "Bar"
     *       }
     *     ]
     *   }
     * ]
     * ```
     *
     * (optional, default: `false`)
     */
    singleMessagesFile?: boolean
    /**
     * If you want the translationManager to log duplicate message ids or not
     *
     * (optional, default: `true`)
     */
    detectDuplicateIds?: boolean
    /**
     * If you want the translationManager to sort it's output, both json and console output
     *
     * (optional, default: `true`)
     */
    sortKeys?: boolean
    /** (optional, default: `{ space: 2, trailingNewline: false }`)) */
    jsonOptions?: any
    /**
     * Here you can specify custom logging methods. If not specified a default printer is used.
     *
     * Possible printers to configure:
     *
     * ```js
     * const printers = {
     *   printDuplicateIds: duplicateIds => {
     *     console.log(`You have ${duplicateIds.length} duplicate IDs`);
     *   },
     *   printLanguageReport: report => {
     *     console.log('Log report for a language');
     *   },
     *   printNoLanguageFile: lang => {
     *     console.log(
     *       `No existing ${lang} translation file found. A new one is created.`
     *     );
     *   },
     *   printNoLanguageWhitelistFile: lang => {
     *     console.log(`No existing ${lang} file found. A new one is created.`);
     *   }
     * };
     * ```
     *
     * (optional, default: `{}`)
     */
    overridePrinters?: any
    /**
     * Here you can specify overrides for the core hooks. If not specified, the default methods will be used.
     *
     * Possible overrides to configure:
     *
     * ```js
     * const overrideCoreMethods = {
     *   provideExtractedMessages: () => {},
     *   outputSingleFile: () => {},
     *   outputDuplicateKeys: () => {},
     *   beforeReporting: () => {},
     *   provideLangTemplate: () => {},
     *   provideTranslationsFile: () => {},
     *   provideWhitelistFile: () => {},
     *   reportLanguage: () => {},
     *   afterReporting: () => {}
     * };
     * ```
     */
    overrideCoreMethods?: any
  }

  /** This will maintain all translation files. Based on your config you will get output for duplicate ids, and per specified language you will get the deleted translations, added messages (new messages that need to be translated), and not yet translated messages. It will also maintain a whitelist file per language where you can specify translation keys where the translation is identical to the default message. This way you can avoid untranslated message warnings for these messages. */
  export default function manageTranslations(config: ManageTranslationsConfig): void;

  /**
   * This is a `babel-plugin-react-intl` specific helper method. It will read all extracted JSON file for the specified directory, filter out all files without any messages, and output an array with all messages.
   *
   * Example output:
   *
   * ```js
   * const extractedMessages = [
   *   {
   *     path: 'src/components/Foo.json',
   *     descriptors: [
   *       {
   *         id: 'foo_ok',
   *         description: 'Ok text',
   *         defaultMessage: 'OK'
   *       }
   *     ]
   *   }
   * ];
   * ```
   */
  export function readMessageFiles(messagesDirectory: string): ExtractedMessage[];
}