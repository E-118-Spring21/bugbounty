# Bug Bounty dApp #

## What is it? ##

A simple application that mediates reports of bugs and companies.

## Running it locally ##

Clone this repo:
```sh
$ git clone https://code.harvard.edu/jos5063/bugbounty.git
$ cd bugbounty
```

For local deployment purposes, we are going to use:
* Node and npm: Run this command to install them: `sudo apt install nodejs npm`
* [Ganache](https://www.trufflesuite.com/ganache): It's used to create a local Ethereum network, for developing and test purposes. I have used and tested the 2.5.4 version.

    * Download and run it. In the initial screen, click on the **New Workspace (Ethereum)** button.
    * In the next page, give it any workspace name you want. Click on the **Add project** button and pick the `truffle-config.js` file from the main directory.
    * Switch to the **Server** tab and put `7545` in the **Port Number** field.
    * Put `1337` in the **Network ID** field.
    * Click on the **Save Workspace** button at the top right.
    * Ganache setup is done. Keep it running in order to run the Bug Bounty app.

* [Truffle](https://www.trufflesuite.com/truffle): It's used to compile, test and deploy the app contracts in a Ethereum network.
    * Install it. Run the command `sudo npm install truffle -g`.
    * The Truffle configuration file (`truffle-config.js`) is pre-configured to connect to the Ganache network created above, at the address `127.0.0.1:7545`.
    * Let's try it. With Ganache open in a separated window/terminal, run the commands:
        * `truffle compile`
        * `truffle test`
        * `truffle migrate`
    * The `migrate` command above deployed the `BugBounty` contract in the Ganache network. You can see it under the **Contracts** page in the Ganache window.
    * The backend of the application is deployed to the network and ready to be consumed.

* [Metamask browser extension](https://metamask.io/download.html): Install this extension on your browser. I've used it on Firefox. Configure it to connect to a `Custom RPC` network, with the following data:
    * Network name: `Ganache`
    * RPC URL: `http://127.0.0.1:7545`
    * Chain ID: `1337`
    * Currency Symbol: `ETH`

Now your browser, through the Metamask extension, is configured to connect to the Ganache network. Thus, every interaction the user makes with the Bug Bounty frontend app will be dispatched to the app backend that's deployed in the Ganache development network. No real ETH is involved. We are almost ready to use the web app. Let's download its dependencies first. Run the command:

```sh
$ npm install
```

Now let's open the web app. We will use a tiny webserver for that. Run the command below, it will open your browser at the page http://localhost:3000. You can now interact with the Bug Bounty dApp :)

```sh
$ npm run dev
```

## Interacting with the application ##

### Actors ###
The app consists of two actors:
1. Bug **Reporter**: A person that finds a bug in a software and reports it targeting some company.
1. **Company**: The target of a bug report

### Flow ###
* The reporter opens the app and uses the first option: **Report a bug**. All three fields are required:
    1. The company, identified by an Ethreum address. This address should be informed by the company.
    1. The bug. Just an identifier of the bug, for example, a SHA computation of the original bug report (pdf, text, email, etc). This identification should be such that the company can verify it. It's also unique in the app.
    1. The reward amount (bounty) in ETH the reporter wants to receive if the company accept the bug report. The company can advertise this reward amount beforehand.

* The reporter sends the bug report in a traditional way (e.g., email) along with the identifier (SHA) informed on step 2 above.

* The company receives the bug report in their systems. They decide whether to approve or reject the report. They then access the Bug Bounty web app and use the third option: **Accept ot reject a bug**. They inform:
    1. The bug identifier (SHA)
    1. If they are going to accept the report: Any ETH amount greater than or equal to the value defined by the reporter above.

* Option 2: **Retrieve bug details** can be used by either the bug reporter or the target company to query details about a particular report. Others cannot see such details.

### Permissions ###
* Anyone can report a bug
* Only the bug report or the target company can query bug details
* Only the company can accept a bug
* Only the bug reporter or the target company can reject a bug

### Sending ETH ###
* Reporting, querying details or rejecting a bug don't require to send ETH, although there is gas fee, with the exception of querying, as it doesn't change state.
* Accepting a bug requires the sending of ETH with the value equal or higher to the one described in the bug report, plus the gas fee.
    * If sending more than the bug bounty, the difference will be retained by the app contract. This is the `BugBounty` app author's reward :)
* For every user interaction that involves a transaction, a MetaMask popup window will ask the user for confirmation. All transactions will be made from the selected account in MetaMask. Pay attention to this, if you have more than one account in MetaMask.