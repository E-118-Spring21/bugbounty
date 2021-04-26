// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BugBounty.sol";

contract TestBugBounty {
    //BugBounty bb = BugBounty(DeployedAddresses.BugBounty());
    //BugBounty bb = new BugBounty();

    address companyA = address(0x054e05C66aCf39125A1243993964a95187913F6A);
    address companyB = address(0x6f58B845B7D7bba4ffDc0AA738184634FcECe0a1);
    string shaOne = "1";
    string shaTwo = "2";

    function testReport() public {
        // Report bug "one", expect it to pass
        BugBounty bb = new BugBounty();
        bb.Report(companyA, 10 ether, shaOne);

        // Same bug reported twice, must fail
        try bb.Report(companyB, 1 ether, shaOne) {
           Assert.fail("duplicated bugs should not be accepted");
        } catch Error(string memory) {
        }
    }

    function testGetBugInfo() public {
        BugBounty bb = new BugBounty();
        bb.Report(companyA, 10 ether, shaOne);
        BugBounty.Bug memory b = bb.GetBugInfo(shaOne);
        Assert.equal(b.company, companyA, "companies don't match");
        Assert.equal(b.reporter, address(this), "reporters don't match");
        Assert.equal(b.bounty, 10 ether, "bounties don't match");
        Assert.equal(b.bugSHA, shaOne, "bugs don't match");
        if (b.state != BugBounty.State.Open) {
            Assert.fail("states don't match");
        }
    }
}