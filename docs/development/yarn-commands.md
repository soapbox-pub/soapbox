# Yarn Commands

The following commands are supported.
You must set `NODE_ENV` to use these commands.
To do so, you can add the following line to your `.env` file:

```
NODE_ENV=development
```

## Local dev server
- `yarn dev` - Run the local dev server.

## Building
- `yarn build` - Compile without a dev server, into `/static` directory.

## Translations
- `yarn i18n` - Rebuilds app and updates English locale to prepare for translations in other languages. Should always be run after editing i18n strings.

- `yarn manage:translations` - A low-level translations manager utility.

## Tests
- `yarn test:all` - Runs all tests and linters.

- `yarn test` - Runs Jest for frontend unit tests.

- `yarn lint` - Runs all linters.

- `yarn lint:js` - Runs only JavaScript linter.

- `yarn lint:sass` - Runs only SASS linter.
