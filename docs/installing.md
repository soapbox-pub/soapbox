# Installing Soapbox

This guide is a step-by-step guide for installing Soapbox. These instructions assume that you're using a fresh, new VPS powered by a Debian-based OS such as Ubuntu.

## Install Pleroma

First, follow the instructions to [install Pleroma](https://docs-develop.pleroma.social/backend/installation/debian_based_en/) on a fresh VPS. We recommend using Ubuntu 20.04 LTS.

## Install Soapbox

The Soapbox frontend is the main component of Soapbox. Once you've installed Pleroma, installing Soapbox is a breeze.

First, ssh into the server and download a .zip of the latest build: `curl -O https://dl.soapbox.pub/main/soapbox.zip`

Then unpack it into Pleroma's `instance` directory: `busybox unzip soapbox.zip -o -d /opt/pleroma/instance/static`

**That's it! 🎉 Soapbox is installed.** The change will take effect immediately, just refresh your browser tab. It's not necessary to restart the Pleroma service.

***For OTP releases,*** *unpack to /var/lib/pleroma instead.*
