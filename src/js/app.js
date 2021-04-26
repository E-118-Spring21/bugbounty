App = {
  contracts: {},
  currentAccount: "",

  init: function () {
    App.initContract();
  },

  initContract: function () {
    $.getJSON('BugBounty.json', function (data) {
      App.contracts.BugBounty = TruffleContract(data);
      App.contracts.BugBounty.setProvider(window.ethereum);
    });
  },

  handleAccountsChanged: function (accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else {
      App.currentAccount = accounts[0];
    }
  },

  connectAndCall: function (callback) {
    closeAlerts();

    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(function (accounts) {
        App.handleAccountsChanged(accounts);
        App.contracts.BugBounty.deployed()
          .then(callback)
          .catch(showError)
      })
      .catch(App.handleError)
  },

  handleReport: function (event) {
    event.preventDefault();

    company = $("#company").val();
    sha = $("#bugSHA").val();
    bounty = $("#bounty").val();
    if (sha == "" || company == "" || bounty == "") {
      showError("Inform all three fields");
      return;
    }

    try {
      bounty = App.contracts.BugBounty.web3.utils.toWei(bounty, "ether");
    } catch (error) {
      showError("Invalid amount");
      return;
    }

    disableButtons();

    App.connectAndCall(function (bugBountyInstance) {
      bugBountyInstance.Report(company, bounty, sha, { from: App.currentAccount })
        .then(function (result) {
          showSuccess("Bug reported sucessfully. Transaction hash: <strong>" + result.tx + "</strong>");
        })
        .catch(App.handleError)
        .finally(enableButtons);
    })

  },

  handleRetrieve: function (event) {
    event.preventDefault();

    sha = $("#bugSHAInfo").val();
    if (sha == "") {
      showError("Inform the bug SHA");
      return;
    }

    disableButtons();

    App.connectAndCall(function (bugBountyInstance) {
      bugBountyInstance.GetBugInfo(sha, { from: App.currentAccount })
        .then(function (details) {
          $("#detail-id").text(details["bugSHA"]);
          $("#detail-reporter").text(details["reporter"]);
          $("#detail-company").text(details["company"]);
          $("#detail-bounty").text(App.contracts.BugBounty.web3.utils.fromWei(details["bounty"], "ether") + " ETH");
          $("#detail-state").text(App.stateToString(details["state"]));
          $("#divBugDetail").addClass("show").show();
        })
        .catch(App.handleError)
        .finally(enableButtons);
    })
  },

  handleError: function (err) {
    if (typeof (err) == "object") {

      if (err.hasOwnProperty("code") && err.hasOwnProperty("message")) {
        if (err.message.startsWith("Error: [ethjs-query] while formatting outputs from RPC '")) {
          errAsString = err.message.replace("Error: [ethjs-query] while formatting outputs from RPC '", "").slice(0, -1);
          obj = JSON.parse(errAsString);
          key = Object.keys(obj.value.data.data)[0];
          showError(obj.value.data.data[key].reason);
          return;
        }
  
        showError(err.message);
        return;
      }

      errAsString = String(err);

      if (errAsString.startsWith("Error: Internal JSON-RPC error.")) {
        errAsString = errAsString.replace("Error: Internal JSON-RPC error.", "");
        obj = JSON.parse(errAsString);
        key = Object.keys(obj.data)[0];
        showError(obj.data[key].reason);
        return;
      }

    }

    showError(err);
  },

  handleAccept: function (event) {
    event.preventDefault();

    sha = $("#bugSHAAccept").val();
    amount = $("#acceptAmount").val();
    if (sha == "" || amount == "") {
      showError("Inform the bug SHA and the bounty amount");
      return;
    }

    try {
      amount = App.contracts.BugBounty.web3.utils.toWei(amount, "ether");
    } catch (error) {
      showError("Invalid amount");
      return;
    }

    disableButtons();

    App.connectAndCall(function (bugBountyInstance) {
      bugBountyInstance.Accept(sha, { from: App.currentAccount, value: amount })
        .then(function (details) {
          showSuccess("Bug accepted sucessfully. Transaction hash: <strong>" + details.tx + "</strong>");
        })
        .catch(App.handleError)
        .finally(enableButtons);
    })
  },

  handleReject: function (event) {
    event.preventDefault();

    sha = $("#bugSHAAccept").val();
    if (sha == "") {
      showError("Inform the bug SHA");
      return;
    }

    disableButtons();
  
    App.connectAndCall(function (bugBountyInstance) {
      bugBountyInstance.Reject(sha, { from: App.currentAccount })
        .then(function (details) {
          showSuccess("Bug rejected sucessfully. Transaction hash: <strong>" + details.tx + "</strong>");
        })
        .catch(App.handleError)
        .finally(enableButtons);
    })
  },

  handleBalance: function () {
    disableButtons();

    App.connectAndCall(function (bugBountyInstance) {
      bugBountyInstance.balance({ from: App.currentAccount })
        .then(function (details) {
          showInfo("Contract balance: " + App.contracts.BugBounty.web3.utils.fromWei(details.toString(), "ether") + " ETH");
        })
        .catch(App.handleError)
        .finally(enableButtons);
    })
  },

  stateToString: function (state) {
    switch (state) {
      case "0": return "Open";
      case "1": return "Accepted";
      case "2": return "Rejected";
      default: return "Unknown";
    }
  }
};
