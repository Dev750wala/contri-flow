// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DevToken is ERC20, Ownable {
    constructor() ERC20("DEV", "DEV") Ownable(msg.sender) {}

    function mintTo(address recipient, uint256 amount) external onlyOwner {
        _mint(recipient, amount);
    }

    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");

        uint256 rate = 1000;
        uint256 amountToBuy = msg.value * rate;

        _mint(msg.sender, amountToBuy);
    }


    // function burn(uint256 amount) external {
    //     require(amount > 0, "amount zero");
    //     uint256 fee = (amount * 2) / 100;
    //     require(amount > fee, "amount <= fee");
    //     _transfer(msg.sender, owner(), fee);
    //     _burn(msg.sender, amount - fee);
    // }

    function getBalance(address account) external view returns (uint256) {
        return balanceOf(account);
    }
}
