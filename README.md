# Soapbox

![Soapbox Screenshot](soapbox-screenshot.png)

**Soapbox** is a frontend for Mastodon and Pleroma with a focus on custom branding and ease of use.

## Try it out

Visit https://fe.soapbox.pub/ and point it to your favorite instance.

## :rocket: Deploy on Pleroma

Installing Soapbox on an existing Pleroma server is extremely easy.
Just ssh into the server and download a .zip of the latest build:

```sh
curl -L https://gitlab.com/soapbox-pub/soapbox/-/jobs/artifacts/develop/download?job=build-production -o soapbox.zip
```

Then unpack it into Pleroma's `instance` directory:

```sh
busybox unzip soapbox.zip -o -d /opt/pleroma/instance
```

**That's it!** :tada:
**Soapbox is installed.**
The change will take effect immediately, just refresh your browser tab.
It's not necessary to restart the Pleroma service.

***For OTP releases,*** *unpack to /var/lib/pleroma instead.*

To remove Soapbox and revert to the default pleroma-fe, simply `rm /opt/pleroma/instance/static/index.html` (you can delete other stuff in there too, but be careful not to delete your own HTML files).

## :elephant: Deploy on Mastodon

See [Installing Soapbox over Mastodon](https://docs.soapbox.pub/frontend/administration/mastodon/).

## How does it work?

Soapbox is a [single-page application (SPA)](https://en.wikipedia.org/wiki/Single-page_application) that runs entirely in the browser with JavaScript.

It has a single HTML file, `index.html`, responsible only for loading the required JavaScript and CSS.
It interacts with the backend through [XMLHttpRequest (XHR)](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

Here is a simplified example with Nginx:

```nginx
location /api {
  proxy_pass http://backend;
}

location / {
  root /opt/soapbox;
  try_files $uri index.html;
}
```

(See [`mastodon.conf`](https://gitlab.com/soapbox-pub/soapbox/-/blob/develop/installation/mastodon.conf) for a full example.)

Soapbox incorporates much of the [Mastodon API](https://docs.joinmastodon.org/methods/), [Pleroma API](https://api.pleroma.social/), and more.
It detects features supported by the backend to provide the right experience for the backend.

# Running locally

To get it running, just clone the repo:

```sh
git clone https://gitlab.com/soapbox-pub/soapbox.git
cd soapbox
```

Ensure that Node.js and Yarn are installed, then install dependencies:

```sh
yarn
```

Finally, run the dev server:

```sh
yarn dev
```

**That's it!** :tada:

It will serve at `http://localhost:3036` by default.

You should see an input box - just enter the domain name of your instance to log in.

Tip: you can even enter a local instance like `http://localhost:3000`!

### Troubleshooting: `ERROR: NODE_ENV must be set`

Create a `.env` file if you haven't already.

```sh
cp .env.example .env
```

And ensure that it contains `NODE_ENV=development`.
Try again.

### Troubleshooting: it's not working!

Run `node -V` and compare your Node.js version with the version in [`.tool-versions`](https://gitlab.com/soapbox-pub/soapbox/-/blob/develop/.tool-versions).
If they don't match, try installing [asdf](https://asdf-vm.com/).

## Local Dev Configuration

The following configuration variables are supported supported in local development.
Edit `.env` to set them.

All configuration is optional, except `NODE_ENV`.

#### `NODE_ENV`

The Node environment.
Soapbox checks for the following options:

- `development` - What you should use while developing Soapbox.
- `production` - Use when compiling to deploy to a live server.
- `test` - Use when running automated tests.

#### `BACKEND_URL`

URL to the backend server.
Can be http or https, and can include a port.
For https, be sure to also set `PROXY_HTTPS_INSECURE=true`.

**Default:** `http://localhost:4000`

#### `PROXY_HTTPS_INSECURE`

Allows using an HTTPS backend if set to `true`.

This is needed if `BACKEND_URL` is set to an `https://` value.
[More info](https://stackoverflow.com/a/48624590/8811886).

**Default:** `false`

# Yarn Commands

The following commands are supported.
You must set `NODE_ENV` to use these commands.
To do so, you can add the following line to your `.env` file:

```sh
NODE_ENV=development
```

#### Local dev server
- `yarn dev` - Run the local dev server.

#### Building
- `yarn build` - Compile without a dev server, into `/static` directory.

#### Translations
- `yarn manage:translations` - Normalizes translation files. Should always be run after editing i18n strings.

#### Tests
- `yarn test:all` - Runs all tests and linters.

- `yarn test` - Runs Jest for frontend unit tests.

- `yarn lint` - Runs all linters.

- `yarn lint:js` - Runs only JavaScript linter.

- `yarn lint:sass` - Runs only SASS linter.

# Contributing

We welcome contributions to this project.
To contribute, see [Contributing to Soapbox](docs/contributing.md).

# Customization

Soapbox supports customization of the user interface, to allow per-instance branding and other features.
Some examples include:

- Instance name
- Site logo
- Favicon
- About page
- Terms of Service page
- Privacy Policy page
- Copyright Policy (DMCA) page
- Promo panel list items, e.g. blog site link
- Soapbox extensions, e.g. Patron module
- Default settings, e.g. default theme

More details can be found in [Customizing Soapbox](docs/customization.md).

# License & Credits

Soapbox is based on [Gab Social](https://code.gab.com/gab/social/gab-social)'s frontend which is in turn based on [Mastodon](https://github.com/tootsuite/mastodon/)'s frontend.

- `static/sounds/chat.mp3` and `static/sounds/chat.oga` are from [notificationsounds.com](https://notificationsounds.com/notification-sounds/intuition-561) licensed under CC BY 4.0.

Soapbox is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Soapbox is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Soapbox.  If not, see <https://www.gnu.org/licenses/>.
