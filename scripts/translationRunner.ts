import fs from 'fs';
import path from 'path';

import * as parser from 'intl-messageformat-parser';
import manageTranslations, { readMessageFiles, ExtractedDescriptor } from 'react-intl-translations-manager';
import yargs from 'yargs';

type Validator = (language: string) => void;

interface LanguageResult {
  language: string
  error: any
}

const RFC5646_REGEXP = /^[a-z]{2,3}(?:-(?:x|[A-Za-z]{2,4}))*$/;

const rootDirectory = path.resolve(__dirname, '..');
const translationsDirectory = path.resolve(rootDirectory, 'app', 'soapbox', 'locales');
const messagesDirectory = path.resolve(rootDirectory, 'build', 'messages');
const availableLanguages = fs.readdirSync(translationsDirectory).reduce((languages, filename) => {
  const basename = path.basename(filename, '.json');
  if (RFC5646_REGEXP.test(basename)) {
    languages.push(basename);
  }
  return languages;
}, [] as string[]);

const testRFC5646: Validator = (language) => {
  if (!RFC5646_REGEXP.test(language)) {
    throw new Error('Not RFC5646 name');
  }
};

const testAvailability: Validator = (language) => {
  if (!availableLanguages.includes(language)) {
    throw new Error('Not an available language');
  }
};

const validateLanguages = (languages: string[], validators: Validator[]): void => {
  const invalidLanguages = languages.reduce((acc, language): LanguageResult[] => {
    try {
      validators.forEach(validator => validator(language));
    } catch (error) {
      acc.push({ language, error });
    }
    return acc;
  }, [] as LanguageResult[]);

  if (invalidLanguages.length > 0) {
    console.error(`
Error: Specified invalid LANGUAGES:
${invalidLanguages.map(({ language, error }) => `* ${language}: ${error.message}`).join('\n')}

Use yarn "manage:translations -- --help" for usage information
`);
    process.exit(1);
  }
};

const usage = `Usage: yarn manage:translations [OPTIONS] [LANGUAGES]

Manage JavaScript translation files in Soapbox. Generates and update translations in translationsDirectory: ${translationsDirectory}

LANGUAGES
The RFC5646 language tag for the language you want to test or fix. If you want to input multiple languages, separate them with space.

Available languages:
${availableLanguages.join(', ')}
`;

const argv = yargs
  .usage(usage)
  .option('f', {
    alias: 'force',
    default: false,
    describe: 'force using the provided languages. create files if not exists.',
    type: 'boolean',
  })
  .parseSync();

// check if message directory exists
if (!fs.existsSync(messagesDirectory)) {
  console.error(`
Error: messagesDirectory not exists
(${messagesDirectory})
Try to run "yarn build" first`);
  process.exit(1);
}

// determine the languages list
const languages: string[] = (argv._.length > 0) ? argv._.map(String) : availableLanguages;

const validators: Validator[] = [
  testRFC5646,
];

if (!argv.force) {
  validators.push(testAvailability);
}

// validate languages
validateLanguages(languages, validators);

// manage translations
manageTranslations({
  messagesDirectory,
  translationsDirectory,
  detectDuplicateIds: false,
  singleMessagesFile: false,
  languages,
  jsonOptions: {
    trailingNewline: true,
  },
});

// Check variable interpolations and print error messages if variables are
// used in translations which are not used in the default message.
/* eslint-disable no-console */

function findVariablesinAST(tree: parser.MessageFormatElement[]): Set<string> {
  const result = new Set<string>();
  tree.forEach((element) => {
    switch (element.type) {
      case parser.TYPE.argument:
      case parser.TYPE.number:
        result.add(element.value);
        break;
      case parser.TYPE.plural:
        result.add(element.value);
        Object.values(element.options)
          .map(option => option.value)
          .forEach(subtree =>
            findVariablesinAST(subtree)
              .forEach(variable => result.add(variable)));
        break;
      case parser.TYPE.literal:
        break;
      default:
        console.log('unhandled element=', element);
        break;
    }
  });
  return result;
}

function findVariables(string: string): Set<string> {
  return findVariablesinAST(parser.parse(string));
}

const extractedMessagesFiles = readMessageFiles(translationsDirectory);
const extractedMessages = extractedMessagesFiles.reduce((acc, messageFile) => {
  messageFile.descriptors.forEach((descriptor) => {
    descriptor.descriptors?.forEach((item) => {
      const variables = findVariables(item.defaultMessage);
      acc.push({
        id: item.id,
        defaultMessage: item.defaultMessage,
        variables: variables,
      });
    });
  });
  return acc;
}, [] as ExtractedDescriptor[]);

interface Translation {
  language: string
  data: Record<string, string>
}

const translations: Translation[] = languages.map((language: string) => {
  return {
    language: language,
    data: JSON.parse(fs.readFileSync(path.join(translationsDirectory, language + '.json'), 'utf8')),
  };
});

function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set(Array.from(a).filter(x => !b.has(x)));
}

function pushIfUnique<T>(arr: T[], newItem: T): void {
  if (arr.every((item) => {
    return (JSON.stringify(item) !== JSON.stringify(newItem));
  })) {
    arr.push(newItem);
  }
}

interface Problem {
  language: string
  id: ExtractedDescriptor['id']
  severity: 'error' | 'warning'
  type: string
}

const problems: Problem[] = translations.reduce((acc, translation) => {
  extractedMessages.forEach((message) => {
    try {
      const translationVariables = findVariables(translation.data[message.id!]);
      if (Array.from(difference(translationVariables, message.variables)).length > 0) {
        pushIfUnique(acc, {
          language: translation.language,
          id: message.id,
          severity: 'error',
          type: 'missing variable      ',
        });
      } else if (Array.from(difference(message.variables, translationVariables)).length > 0) {
        pushIfUnique(acc, {
          language: translation.language,
          id: message.id,
          severity: 'warning',
          type: 'inconsistent variables',
        });
      }
    } catch (error) {
      pushIfUnique(acc, {
        language: translation.language,
        id: message.id,
        severity: 'error',
        type: 'syntax error          ',
      });
    }
  });
  return acc;
}, [] as Problem[]);

if (problems.length > 0) {
  console.error(`${problems.length} messages found with errors or warnings:`);
  console.error('\nLoc\tIssue            \tMessage ID');
  console.error('-'.repeat(60));

  problems.forEach((problem) => {
    const color = (problem.severity === 'error') ? '\x1b[31m' : '';
    console.error(`${color}${problem.language}\t${problem.type}\t${problem.id}\x1b[0m`);
  });
  console.error('\n');
  if (problems.find((item) => {
    return item.severity === 'error';
  })) {
    process.exit(1);
  }
}
