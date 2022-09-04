# Updating Soapbox

You should always check the [release notes/changelog](https://gitlab.com/soapbox-pub/soapbox/-/blob/develop/CHANGELOG.md) in case there are deprecations, special update changes, etc.

Besides that, it's relatively pretty easy to update Soapbox. There's two ways to go about it: with the command line or with an unofficial script.

## Updating with the command line

To update Soapbox via the command line, do the following:

```
# Download the build.
curl -L https://gitlab.com/soapbox-pub/soapbox/-/jobs/artifacts/develop/download?job=build-production -o soapbox-fe.zip

# Remove all the current Soapbox build in Pleroma's instance directory.
rm -R /opt/pleroma/instance/static/packs
rm /opt/pleroma/instance/static/index.html
rm -R /opt/pleroma/instance/static/sounds

# Unzip the new build to Pleroma's instance directory.
busybox unzip soapbox-fe.zip -o -d /opt/pleroma/instance
```

## After updating Soapbox

The changes take effect immediately, just refresh your browser tab. It's not necessary to restart the Pleroma service.
