**Soapbox** is customizable open-source software that puts the power of social media in the hands of the people. Feature-rich and hyper-focused on providing a user experience to rival Big Tech, Soapbox is already home to some of the biggest alternative social platforms.

This repository is a fork of **Soapbox** customized for and by purg (purg.com).  Please see https://gitlab.com/soapbox-pub/soapbox for all original details and information regarding Soapbox for use on your own fediverse based social network server.

## _Building this Repository (purg.com fork)_
**REQUIREMENTS:** NodeJS 18.12.1+, yarn package manager  

Clone the repo:  
```git clone https://github.com/purg-com/soapbox.git```

Enter the created directory for the cloned repository.  

Configure for updated yarn:    
Linux (bash): ```chmod 777 && update-yarn.sh```  
Windows: ```update-yarn.cmd```

Install dependencies:  
```yarn install```

Run Webpack:  
Linux (bash): ```NODE_ENV=production npx webpack```  
Windows: ```SET NODE_ENV=production && npx webpack```  

Built / Transpiled / Compiled application will be in the ```./static``` directory when complete.

---

![Soapbox Screenshot](soapbox-screenshot.png)

<br>

## Contributing

We welcome contributions to this project.  To contribute, see [Contributing to Soapbox](docs/contributing.md).

Translators can help by providing [translations through Weblate](https://hosted.weblate.org/projects/soapbox-pub/soapbox/).  Native speakers from all around the world are welcome!

<br>

## Project Philosophy

Soapbox was born out of the need to build independent platforms with **a unique identity and brand**.

This is in contrast to Mastodon's idea, where all servers are called "Mastodon" and use the Mastodon colors and logo. Users won't see the word "Soapbox" throughout the UI, they'll see the name of **your website** and your logo. To facilitate this, Soapbox has a robust customization UI and integrated moderation tools. Large servers are a priority.

One disadvantage of this approach is that it does not help the software spread. Some of the biggest servers on the network and running Soapbox and people don't even know it!

<br>

# License & Credits

© Alex Gleason & other Soapbox contributors  
© Eugen Rochko & other Mastodon contributors  
© Trump Media & Technology Group  
© Gab AI, Inc.  

Soapbox is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Soapbox is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Soapbox. If not, see <https://www.gnu.org/licenses/>.
