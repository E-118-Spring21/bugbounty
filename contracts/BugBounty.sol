// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

contract BugBounty {

    enum State {
        Open,
        Accepted,
        Rejected
    }

    struct Bug {
        address company;
        address payable reporter;
        uint bounty;
        State state;
        string bugSHA;
    }
    
    address private immutable owner;
    mapping (string => Bug) private bugs;

    constructor() {
        owner = msg.sender;
    }

    function Report(address _company, uint _bounty, string memory _bugSHA) external {
        Bug storage newBug = bugs[_bugSHA];
        require(newBug.reporter == address(0x0), "This bug was already reported");

        newBug.company = _company;
        newBug.reporter = msg.sender;
        newBug.bounty = _bounty;
        newBug.bugSHA = _bugSHA;
        newBug.state = State.Open;
    }

    function Accept(string memory _bugSHA) external payable {
        Bug storage bug = bugs[_bugSHA];
        require(bug.reporter != address(0x0), "Bug not found");
        require(bug.company == msg.sender, "Not authorized");
        require(bug.state == State.Open, "Invalid state");
        require(bug.bounty <= msg.value, "Invalid amount");
    
        bug.reporter.transfer(bug.bounty);
        bug.state = State.Accepted;
    }
    
    function Reject(string memory _bugSHA) external {
        Bug storage bug = bugs[_bugSHA];
        require(bug.reporter != address(0x0), "Bug not found");
        require(bug.company == msg.sender || bug.reporter == msg.sender, "Not authorized");
        require(bug.state == State.Open, "Invalid state");
    
        bug.state = State.Rejected;
    }

    function GetBugInfo(string memory _bugSHA) external view returns (Bug memory) {
        Bug storage bug = bugs[_bugSHA];
        require(bug.reporter != address(0x0), "Bug not found");
        require(bug.company == msg.sender || bug.reporter == msg.sender, "Not authorized");

        return bug;
    }

    function balance() external view returns (uint) {
        require(msg.sender == owner, "Not authorized");
        return address(this).balance;
    }
}
