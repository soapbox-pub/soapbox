# Installing Soapbox via YunoHost

If you want to install Soapbox to a Pleroma instance installed using [YunoHost](https://yunohost.org), you can do so by following these steps.

## 1. Download the build

First, download the latest build of Soapbox from GitLab.

```sh
curl -L https://gitlab.com/soapbox-pub/soapbox/-/jobs/artifacts/develop/download?job=build-production -o soapbox-fe.zip
```

## 2. Unzip the build

Then, unzip the build to the Pleroma directory under YunoHost's directory:

```sh
busybox unzip soapbox-fe.zip -o -d /home/yunohost.app/pleroma/
```

## 3. Change YunoHost Admin Static directory

(A bug documented in the YunoHost deployment about this issue is [here](https://github.com/YunoHost-Apps/pleroma_ynh/issues/215))

Go to:

> Admin Panel > Settings > Instance

Look for the "Static dir" entry and set it to:

> /home/yunohost.app/pleroma/static

**That's it! 🎉 Soapbox is installed.** The change will take effect immediately, just refresh your browser tab. It's not necessary to restart the Pleroma service.

---

Thank you to [@jeroen@social.franssen.xyz](https://social.franssen.xyz/@jeroen) for discovering this method.
