# Platform Client (Mzima)

> This Platform Client (Mzima) workspace is generated using [Nx, a Smart, fast and extensible build system.](https://nx.dev)

This Platform Client (Mzima) repo houses 2 clients: The web client and the mobile client. Find the installation instructions below.

#

### Requirements

- Memory (RAM) and storage: RAM - Minimum 8GB, 16GB is recommended for smoother multitasking; Storage - minimum 512GB. Consider 1TB if you plan to have multiple development environments. SSD storage is recommended for faster reading and writing speed
- Operating systems: Mac OS, Linux, windows (If you are having issues with windows you can set up WSL - windows Subsystem for Linux)
- Node.js version: Node.js versions >= 18
- Git: our Git workflow instructions show how to use git on the command line only for now

#

### Cloning this repository: Contributors

> Fork this repository. Then clone the forked repository.

If you are using `https` url, the clone command with your url will look like this:

```
git clone https://github.com/your-own-github-account-user-name-will-be-here-instead/platform-client-mzima.git
```

If you are using `SSH` url, the clone command with your url will look like this:

```
git clone git@github.com:your-own-github-account-user-name-will-be-here-instead/platform-client-mzima.git
```

> Also visit [how to make and submit changes to this repository](https://github.com/ushahidi/platform-client-mzima#how-to-make-and-submit-changes-to-this-repository)

#

### Cloning this repository: Repo maintainers

> Clone this repository directly.

If you are using `https` url, use:

```
git clone https://github.com/ushahidi/platform-client-mzima.git
```

If you are using `SSH` url, use:

```
git clone git@github.com:ushahidi/platform-client-mzima.git
```

> Also visit [how to make and submit changes to this repository](https://github.com/ushahidi/platform-client-mzima#how-to-make-and-submit-changes-to-this-repository)

#

### Installing dependencies

You need this step whether you are developing for the web client or the mobile client. After cloning, change directory into the root of this repository, then install dependencies:

```
npm install
```

#

### Web Client: Launch in web browser

In the root of this repository, run the script command in the code block below to get the web client running locally on your computer, and in the web browser:

```
npm run web:serve
```

> Find the code for web client inside of the `apps/web-mzima-client` folder

### Web Client: Set up and connect to the backend platform API

After running the `web:serve` script command above, you should be able to open up the web client's user interface in the browser.

The web client is currently connected to our staging API. This is set in the web client's `env.json` file with:

```
"backend_url": "https://mzima-dev-api.staging.ush.zone/",
```

You can choose to set up your own backend locally using our [backend platform API](https://github.com/ushahidi/platform), and connect it to the web client instead. To set up the backend for yourself, follow the installation instructions on the [backend API's readme](https://github.com/ushahidi/platform#setup-essentials). Then replace the `"backend_url"` value in the web client's `env.json` file with the url of the backend you have successfully setup.

#

### Web Client: Test codebase to acessiblity using Pa11y

To start using Pa11y for accessibility testing, follow these simple steps:

(Since Pa11y is a Dev Dependency, running the inital `npm install`would install the pa11y package in your node_module)

1. Ensure you have lunch the platform in web browser.

2. Incase you have not lunched the web client, run

```
npm run web:serve
```

3. Usage: To run pa11y on a specific URL:`pa11y http://example.com`

Replace the http://example.com with the URL you want to test for accessibility,
For Example:

```
pa11y http://localhost:4200/map
```

4. Optionally, you can output the results to a file for further analysis:

```
pa11y http://example.com --reporter html > accessibility-report.html
```

#

### Mobile Client: Launch in web browser

> Ensure you have run the `install` script command in the root of this repository as directed earlier, before you proceed

In the root of this repository, run the script command in the code block below to get the mobile client running locally on your computer, and in the web browser:

```
npm run mobile:serve
```

If this is the first time you are trying to run the mobile client in the browser, you will need to do some setup otherwise the `mobile:serve` script command will not run the mobile client successfully. The setup steps have been outlined below.

Change directory into `apps/mobile-mzima-client` folder to install dependencies specific to the mobile client:

```
npm install
```

Mac OS users may encounter some install request timeout errors caused by vips at this point (for persons using other Operating Systems you can let the community know if you face any install problems and the solution so that it can be documented accordingly). If you are using homebrew, check or get vips info from homebrew:

```
brew info vips
```

Then Re-install vips:

```
brew reinstall vips
```

After reinstalling vips, run the `install` script command in the `apps/mobile-mzima-client` folder again. It should now install the mobile client dependencies successfully.

Change directory back into the root of this repository and run the `mobile:serve` script command again. The mobile client should now run in the web browser successfully.

> Find the code for mobile client inside of the `apps/mobile-mzima-client` folder

### Mobile Client: Launch in Android emulator

> First try to successfully launch the mobile client in the web browser, as the initial setup steps have been addressed in that section

Have (up-to-date version of) android studio installed on your computer so that you can be able to open up the user interface on an android mobile phone emulator.

If you can run the `mobile:serve` script command above without problems, then you can already launch the mobile client on an android emulator if you have android studio and have set up an android emulator in android studio.

The android emulator devices that would generally work are android versions 11.0 and above.

Once android studio and emulators have been set up, in the root of this repository, always run the script command in the code block below anytime you want to launch/open the mobile client on an android phone emulator:

```
npm run mobile:android
```

### Mobile Client: Launch in iOS simulator

> First try to successfully launch the mobile client in the web browser, as the initial steps have been addressed in that section

You can only develop the mobile client for iOS or run an iOS simulator with a Mac OS computer.

First visit the [iOS requirements section of the capacitor js documentation](https://capacitorjs.com/docs/getting-started/environment-setup#ios-requirements) and ensure that you have these 4 tools are installed or updated successfully: Xcode, Xcode Command Line Tools, Homebrew, Cocoapods.

Once those needed tools have been set up, in the root of this repository, always run the script command in the code block below anytime you want to launch/open the mobile client on an ios simulator:

```
npm run mobile:ios
```

If you run into any errors while running the `mobile:ios` script command, you can always run the command in the code block below to outline problems and what you can do to resolve it:

```
npx cap sync ios
```

Once the `cap sync` script command is successful, change directory back into the root of this repository and run the `mobile:ios` script command again. The mobile client should now run in xcode and ios simulator successfully.

### Mobile Client: Script commands

`npm run mobile:serve` - "nx run mobile-mzima-client:serve",

`npm run mobile:android` - "nx run mobile-mzima-client:cap:android",

`npm run mobile:ios` - "nx run mobile-mzima-client:cap:ios",

`npm run mobile:build` - "nx run mobile-mzima-client:build",

`npm run mobile:add-android` - "nx run mobile-mzima-client:cap:add-android",

`npm run mobile:add-ios` - "nx run mobile-mzima-client:cap:add-ios",

`npm run mobile:sync` - "nx run mobile-mzima-client:cap:sync",

#

### Platform Client (Mzima) workspace: Script commands and help

Understand this workspace: Run `nx graph` to see a diagram of the dependencies of the projects

Remote caching: Run `npx nx connect-to-nx-cloud` to enable [remote caching](https://nx.app) and make CI faster.

Further help: Visit the [Nx Documentation](https://nx.dev) to learn more

#

### How to make and submit changes to this repository

Except you are requested to create your branch from another branch, always create your new branch from the `development` branch:

```
git checkout development
```

```
git checkout -b replace-this-part-with-the-name-of-your-new-branch
```

Make the desired changes you wish to submit to the project, add, commit and push your changes:

```
git add .
```

```
git commit -m "replace this part with a commit message that describes your changes"
```

```
git push origin replace-this-part-with-the-name-of-your-branch
```

Then send a pull request for your changes to be reviewed.
