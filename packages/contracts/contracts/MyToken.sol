// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDC_750 is ERC20, Ownable {
    constructor() ERC20("US", "US") Ownable(msg.sender) { }

    function mintUS(uint256 amount, address recipient) external onlyOwner {
        _mint(recipient, amount);
    }

    function burn(uint256 amount) external {
        uint256 fee = (amount * 2) / 100;

        _transfer(msg.sender, owner(), fee);
        _burn(msg.sender, amount - fee);
    }

    function getBalance(address account) external view returns (uint256) {
        return balanceOf(account) / (10 ** decimals());
    }
}
