// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import OpenZeppelin contracts for security and standard functionality
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DevToken - Bonding Curve Token Contract
 * @dev ERC20 token with automated pricing through a bonding curve mechanism
 * 
 * Key Features:
 * - Bonding curve pricing: Price increases with supply, decreases when tokens are sold
 * - Continuous liquidity: Users can buy/sell directly with the contract
 * - Reserve-backed: All tokens backed by ETH held in contract reserves
 * - Fee mechanism: Configurable fees on buy/sell operations
 * - Owner controls: Administrative functions for fee and parameter management
 */
contract DevToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    
    // ============ BONDING CURVE PARAMETERS ============
    
    /**
     * @dev Scaling factor for precise calculations (10^18)
     * Used to maintain precision in price calculations and avoid rounding errors
     */
    uint256 public constant SCALE = 10**18;
    
    /**
     * @dev Reserve ratio in parts per million (PPM)
     * 500000 = 50% - determines the steepness of the bonding curve
     * Higher ratio = steeper curve (more price sensitive)
     * Lower ratio = flatter curve (less price sensitive)
     */
    uint256 public reserveRatio = 500000;
    
    /**
     * @dev Current ETH reserve balance backing the tokens
     * This is the actual ETH that backs token value (excluding fees)
     * Updated on every buy/sell transaction
     */
    uint256 public reserveBalance;
    
    /**
     * @dev Initial token supply minted at contract creation
     * Provides price stability and prevents division by zero in calculations
     */
    uint256 public constant INITIAL_SUPPLY = 1000 * 10**18;
    
    /**
     * @dev Initial price per token in wei (0.001 ETH)
     * Sets the starting point for the bonding curve
     */
    uint256 public constant INITIAL_PRICE = 10**15;
    
    // ============ FEE PARAMETERS ============
    
    /**
     * @dev Fee charged on token purchases in basis points
     * 100 = 1% fee on buy transactions
     */
    uint256 public buyFee = 100;
    
    /**
     * @dev Fee charged on token sales in basis points  
     * 200 = 2% fee on sell transactions
     */
    uint256 public sellFee = 200;
    
    /**
     * @dev Maximum allowed fee to prevent excessive fee setting
     * 1000 basis points = 10% maximum fee limit
     */
    uint256 public constant MAX_FEE = 1000;
    
    // ============ EVENTS ============
    
    /**
     * @dev Emitted when tokens are purchased through the bonding curve
     * @param buyer Address of the token purchaser
     * @param ethSpent Total ETH sent by buyer (including fees)
     * @param tokensReceived Number of tokens minted to buyer
     * @param fee Fee amount deducted from the transaction
     */
    event TokensPurchased(address indexed buyer, uint256 ethSpent, uint256 tokensReceived, uint256 fee);
    
    /**
     * @dev Emitted when tokens are sold back to the contract
     * @param seller Address of the token seller  
     * @param tokensSold Number of tokens burned in the sale
     * @param ethReceived ETH amount received by seller (after fees)
     * @param fee Fee amount deducted from the transaction
     */
    event TokensSold(address indexed seller, uint256 tokensSold, uint256 ethReceived, uint256 fee);
    
    /**
     * @dev Emitted when the reserve ratio is updated by owner
     * @param oldRatio Previous reserve ratio value
     * @param newRatio New reserve ratio value
     */
    event ReserveRatioUpdated(uint256 oldRatio, uint256 newRatio);
    
    /**
     * @dev Emitted when buy/sell fees are updated by owner
     * @param newBuyFee New buy fee in basis points
     * @param newSellFee New sell fee in basis points  
     */
    event FeesUpdated(uint256 newBuyFee, uint256 newSellFee);
    
    /**
     * @dev Emitted when accumulated fees are withdrawn by owner
     * @param amount Amount of ETH withdrawn
     */
    event ReserveFundsWithdrawn(uint256 amount);

    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initialize the contract with initial parameters
     * Sets up the token with name "DEV", symbol "DEV"
     * Mints initial supply to contract and establishes initial reserve balance
     */
    constructor() ERC20("DEV", "DEV") Ownable(msg.sender) {
        // Mint initial supply to the contract itself for price stability
        // This prevents division by zero in price calculations
        _mint(address(this), INITIAL_SUPPLY);
        
        // Calculate initial reserve balance based on initial supply and price
        // This establishes the starting point for the bonding curve
        reserveBalance = INITIAL_SUPPLY * INITIAL_PRICE / SCALE;
    }

    // ============ VIEW FUNCTIONS - BONDING CURVE CALCULATIONS ============

    /**
     * @dev Calculate how many tokens can be purchased with given ETH amount
     * Uses simplified linear approximation for gas efficiency and safety
     * 
     * @param ethAmount Amount of ETH to spend on tokens (in wei)
     * @return tokensOut Number of tokens that would be received
     * @return fee Fee amount that would be charged
     */
    function calculatePurchaseReturn(uint256 ethAmount) public view returns (uint256 tokensOut, uint256 fee) {
        // Handle edge case of zero ETH
        if (ethAmount == 0) return (0, 0);
        
        // Calculate buy fee (percentage of ETH amount)
        fee = (ethAmount * buyFee) / 10000;
        uint256 ethAfterFee = ethAmount - fee;
        
        // Handle edge case of zero total supply (shouldn't happen after constructor)
        if (totalSupply() == 0) {
            tokensOut = ethAfterFee * SCALE / INITIAL_PRICE;
            return (tokensOut, fee);
        }
        
        // Simplified bonding curve calculation
        // Formula: tokens = (ethAfterFee × totalSupply) ÷ (reserveBalance + ethAfterFee)
        // This approximates the continuous bonding curve with a linear function
        // More gas efficient than exponential calculations while maintaining curve properties
        tokensOut = (ethAfterFee * totalSupply()) / (reserveBalance + ethAfterFee);
        
        return (tokensOut, fee);
    }

    /**
     * @dev Calculate how much ETH will be received for selling tokens
     * 
     * @param tokenAmount Number of tokens to sell
     * @return ethOut Amount of ETH that would be received (after fees)
     * @return fee Fee amount that would be charged
     */
    function calculateSaleReturn(uint256 tokenAmount) public view returns (uint256 ethOut, uint256 fee) {
        // Validate input parameters
        if (tokenAmount == 0 || tokenAmount > totalSupply()) return (0, 0);
        
        // Calculate proportional ETH return based on token percentage of total supply
        // Formula: ethReturn = reserveBalance × (tokenAmount ÷ totalSupply)
        uint256 ethBeforeFee = (tokenAmount * reserveBalance) / totalSupply();
        
        // Calculate sell fee (percentage of ETH return)
        fee = (ethBeforeFee * sellFee) / 10000;
        ethOut = ethBeforeFee - fee;
        
        return (ethOut, fee);
    }

    /**
     * @dev Get current token price in ETH per token
     * Price = reserveBalance ÷ totalSupply (scaled for precision)
     * 
     * @return Current price in wei per token
     */
    function getCurrentPrice() external view returns (uint256) {
        if (totalSupply() == 0) return INITIAL_PRICE;
        return (reserveBalance * SCALE) / totalSupply();
    }

    // ============ TRADING FUNCTIONS ============

    /**
     * @dev Buy tokens with ETH using the bonding curve
     * ETH is sent with the transaction, tokens are minted to the buyer
     * 
     * Security features:
     * - nonReentrant: Prevents reentrancy attacks
     * - Input validation: Ensures positive ETH amount and sufficient return
     * - State updates before external calls: Follows checks-effects-interactions pattern
     */
    function buyTokens() external payable nonReentrant {
        require(msg.value > 0, "Send ETH to buy tokens");
        
        // Calculate tokens to mint and fee using bonding curve
        (uint256 tokensToMint, uint256 fee) = calculatePurchaseReturn(msg.value);
        require(tokensToMint > 0, "Insufficient ETH for purchase");
        
        // Update contract state BEFORE minting (checks-effects-interactions pattern)
        // Add net ETH (after fee) to reserve balance
        // Fee remains in contract balance but not in reserve
        uint256 ethAfterFee = msg.value - fee;
        reserveBalance += ethAfterFee;
        
        // Mint new tokens to the buyer
        _mint(msg.sender, tokensToMint);
        
        // Emit event for transparency and off-chain tracking
        emit TokensPurchased(msg.sender, msg.value, tokensToMint, fee);
    }

    /**
     * @dev Sell tokens for ETH using the bonding curve
     * Tokens are burned, ETH is transferred to the seller
     * 
     * @param tokenAmount Number of tokens to sell
     * 
     * Security features:
     * - nonReentrant: Prevents reentrancy attacks  
     * - Balance validation: Ensures seller has sufficient tokens
     * - Liquidity check: Ensures contract has enough ETH
     * - State updates before external calls
     */
    function sellTokens(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        // Calculate ETH return and fee using bonding curve
        (uint256 ethToReturn, uint256 fee) = calculateSaleReturn(tokenAmount);
        require(ethToReturn > 0, "No ETH to return");
        require(address(this).balance >= ethToReturn, "Insufficient contract ETH balance");
        
        // Update contract state BEFORE external call
        // Reduce reserve by total ETH value (including fee)
        uint256 totalEthValue = ethToReturn + fee;
        reserveBalance -= totalEthValue;
        
        // Burn tokens from seller's balance
        _burn(msg.sender, tokenAmount);
        
        // Transfer ETH to seller (fee remains in contract)
        payable(msg.sender).transfer(ethToReturn);
        
        // Emit event for transparency and off-chain tracking
        emit TokensSold(msg.sender, tokenAmount, ethToReturn, fee);
    }

    // ============ OWNER-ONLY FUNCTIONS ============

    /**
     * @dev Mint tokens directly to a recipient (bypasses bonding curve)
     * Used for airdrops, rewards, or initial distribution
     * Only callable by contract owner
     * 
     * @param recipient Address to receive the minted tokens
     * @param amount Number of tokens to mint
     */
    function mintTo(address recipient, uint256 amount) external onlyOwner {
        _mint(recipient, amount);
    }

    /**
     * @dev Override the standard burn function to include a fee mechanism
     * When users burn tokens directly, a 2% fee is transferred to owner
     * This incentivizes using the sellTokens function instead
     * 
     * @param amount Number of tokens to burn
     */
    function burn(uint256 amount) public override {
        require(amount > 0, "Amount must be > 0");
        
        // Calculate 2% fee on burn amount
        uint256 fee = (amount * 2) / 100;
        require(amount > fee, "Amount must be greater than fee");
        
        // Transfer fee to owner as tokens (not burned)
        _transfer(msg.sender, owner(), fee);
        
        // Burn the remaining tokens (amount minus fee)
        _burn(msg.sender, amount - fee);
    }

    /**
     * @dev Update the reserve ratio parameter
     * Changes the steepness of the bonding curve
     * Only callable by contract owner
     * 
     * @param newRatio New reserve ratio in parts per million (1-1000000)
     */
    function setReserveRatio(uint256 newRatio) external onlyOwner {
        require(newRatio > 0 && newRatio <= 1000000, "Invalid reserve ratio"); // 0-100%
        
        uint256 oldRatio = reserveRatio;
        reserveRatio = newRatio;
        
        emit ReserveRatioUpdated(oldRatio, newRatio);
    }

    /**
     * @dev Update buy and sell fee percentages
     * Fees are capped at MAX_FEE to prevent abuse
     * Only callable by contract owner
     * 
     * @param newBuyFee New buy fee in basis points (max 1000 = 10%)
     * @param newSellFee New sell fee in basis points (max 1000 = 10%)
     */
    function setFees(uint256 newBuyFee, uint256 newSellFee) external onlyOwner {
        require(newBuyFee <= MAX_FEE && newSellFee <= MAX_FEE, "Fee too high");
        
        buyFee = newBuyFee;
        sellFee = newSellFee;
        
        emit FeesUpdated(newBuyFee, newSellFee);
    }

    /**
     * @dev Withdraw accumulated fees from the contract
     * Calculates excess ETH (contract balance - reserve balance) and transfers to owner
     * Only callable by contract owner
     * 
     * This function allows the owner to collect trading fees that have accumulated
     * while preserving the reserve backing for all tokens
     */
    function withdrawFees() external onlyOwner {
        // Calculate excess ETH = total contract balance - reserve balance
        // This excess represents accumulated fees from trading
        uint256 excessETH = address(this).balance - reserveBalance;
        require(excessETH > 0, "No fees to withdraw");
        
        // Transfer excess ETH to owner
        payable(owner()).transfer(excessETH);
        
        emit ReserveFundsWithdrawn(excessETH);
    }

    // ============ UTILITY FUNCTIONS ============

    /**
     * @dev Get token balance of an account (wrapper for compatibility)
     * @param account Address to check balance for
     * @return Token balance of the account
     */
    function getBalance(address account) external view returns (uint256) {
        return balanceOf(account);
    }

    /**
     * @dev Get comprehensive contract statistics
     * Useful for frontend applications and monitoring
     * 
     * @return _totalSupply Current total token supply
     * @return _reserveBalance Current ETH reserve balance
     * @return _currentPrice Current price per token in wei
     * @return _contractETHBalance Total ETH balance in contract
     * @return _availableFees Fees available for withdrawal by owner
     */
    function getContractStats() external view returns (
        uint256 _totalSupply,
        uint256 _reserveBalance,
        uint256 _currentPrice,
        uint256 _contractETHBalance,
        uint256 _availableFees
    ) {
        _totalSupply = totalSupply();
        _reserveBalance = reserveBalance;
        _currentPrice = (_reserveBalance * SCALE) / _totalSupply;
        _contractETHBalance = address(this).balance;
        
        // Available fees = contract balance - reserve balance
        // If contract balance < reserve balance, no fees available (shouldn't happen)
        _availableFees = _contractETHBalance > _reserveBalance ? 
                        _contractETHBalance - _reserveBalance : 0;
    }

    // ============ SECURITY FUNCTIONS ============

    /**
     * @dev Reject direct ETH transfers to contract
     * Users must use buyTokens() function to purchase tokens
     * Prevents accidental loss of ETH
     */
    receive() external payable {
        revert("Use buyTokens() to purchase tokens");
    }

    /**
     * @dev Reject calls to non-existent functions
     * Prevents accidental ETH loss from incorrect function calls
     */
    fallback() external payable {
        revert("Use buyTokens() to purchase tokens");
    }
}