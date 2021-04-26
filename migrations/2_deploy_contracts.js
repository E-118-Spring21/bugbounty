const BugBounty = artifacts.require("BugBounty");

module.exports = function (deployer) {
  deployer.deploy(BugBounty);
};
