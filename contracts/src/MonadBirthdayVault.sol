// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MonadBirthdayNFT.sol";

/**
 * @title MonadBirthdayVault
 * @notice Time-Locked Birthday Gift Vault & Social Yield Pool on Monad Blockchain.
 * @dev Contributions stay in this contract. Yield is a bonus paid from a reserve, and claims mint a Dynamic On-Chain SVG NFT Booklet.
 */
contract MonadBirthdayVault is Ownable, ReentrancyGuard {
    
    struct Greeting {
        address sender;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    struct Vault {
        uint256 id;
        address payable creator;
        address payable recipient;
        string recipientName;
        uint256 targetAmount;       // Target pool size in MON wei
        uint256 birthdayTimestamp;  // Time-lock unlock timestamp
        uint256 totalCollected;    // Total principal collected in wei
        bool isClaimed;
        bool isYieldActive;
        uint256 nftTokenId;        // Dynamic NFT Token ID minted upon claim
        uint256 createdAt;
    }

    uint256 public constant MAX_NAME_LENGTH = 48;
    uint256 public constant MAX_MESSAGE_LENGTH = 280;

    uint256 public vaultCounter;
    MonadBirthdayNFT public nftContract;

    /// @notice Sum of principal still locked in unclaimed vaults. Yield is only paid from MON above this.
    uint256 public totalLockedPrincipal;

    /// @notice Lets the vault creator, recipient or owner release before the birthday (hackathon demo).
    bool public demoModeEnabled = true;

    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => Greeting[]) public vaultGreetings;

    // Events
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed creator,
        address indexed recipient,
        string recipientName,
        uint256 targetAmount,
        uint256 birthdayTimestamp
    );
    event ContributionReceived(
        uint256 indexed vaultId,
        address indexed contributor,
        uint256 amount,
        string message,
        uint256 totalCollected
    );
    event GiftClaimed(
        uint256 indexed vaultId,
        address indexed recipient,
        uint256 principalAmount,
        uint256 yieldBonus,
        uint256 totalPayout,
        uint256 nftTokenId
    );

    event DemoModeUpdated(bool enabled);

    constructor(address _nftAddress, address initialOwner) Ownable(initialOwner) {
        nftContract = MonadBirthdayNFT(_nftAddress);
    }

    function setNFTContract(address _nftAddress) external onlyOwner {
        nftContract = MonadBirthdayNFT(_nftAddress);
    }

    function setDemoMode(bool _enabled) external onlyOwner {
        demoModeEnabled = _enabled;
        emit DemoModeUpdated(_enabled);
    }

    /// @notice MON held above locked principal, available to pay yield bonuses.
    function yieldReserve() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance > totalLockedPrincipal ? balance - totalLockedPrincipal : 0;
    }

    /// @dev Names end up inside the NFT JSON and SVG, so keep them short and free of markup/quote characters.
    function _isSafeName(string memory _name) internal pure returns (bool) {
        bytes memory b = bytes(_name);
        if (b.length == 0 || b.length > MAX_NAME_LENGTH) return false;
        for (uint256 i; i < b.length; i++) {
            bytes1 c = b[i];
            if (c < 0x20 || c == '"' || c == "<" || c == ">" || c == "&" || c == "\\") return false;
        }
        return true;
    }

    /// @dev Yield accrues from creation until the birthday, never after.
    function _accruedSeconds(Vault storage vault) internal view returns (uint256) {
        uint256 end = block.timestamp < vault.birthdayTimestamp ? block.timestamp : vault.birthdayTimestamp;
        return end > vault.createdAt ? end - vault.createdAt : 0;
    }

    /**
     * @notice Create a new Time-Locked Birthday Vault
     * @param _recipient Recipient wallet address
     * @param _recipientName Recipient's name for display
     * @param _durationInDays Pool duration in days (e.g. 30 days)
     * @param _targetAmount Target amount in MON (wei)
     */
    function createVault(
        address payable _recipient,
        string memory _recipientName,
        uint256 _durationInDays,
        uint256 _targetAmount
    ) external returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(_durationInDays > 0 && _durationInDays <= 366, "Duration must be 1-366 days");
        require(_isSafeName(_recipientName), "Invalid recipient name");

        vaultCounter++;
        uint256 unlockTime = block.timestamp + (_durationInDays * 1 days);

        vaults[vaultCounter] = Vault({
            id: vaultCounter,
            creator: payable(msg.sender),
            recipient: _recipient,
            recipientName: _recipientName,
            targetAmount: _targetAmount,
            birthdayTimestamp: unlockTime,
            totalCollected: 0,
            isClaimed: false,
            isYieldActive: true,
            nftTokenId: 0,
            createdAt: block.timestamp
        });

        emit VaultCreated(
            vaultCounter,
            msg.sender,
            _recipient,
            _recipientName,
            _targetAmount,
            unlockTime
        );

        return vaultCounter;
    }

    /**
     * @notice Contribute to a Birthday Vault with an on-chain greeting message
     * @param _vaultId Target Vault ID
     * @param _message Greeting message
     */
    function contribute(uint256 _vaultId, string memory _message) external payable nonReentrant {
        Vault storage vault = vaults[_vaultId];
        require(vault.id != 0, "Vault does not exist");
        require(block.timestamp < vault.birthdayTimestamp, "Vault unlock time reached or closed");
        require(!vault.isClaimed, "Vault already claimed");
        require(msg.value > 0, "Contribution must be > 0 MON");
        require(bytes(_message).length <= MAX_MESSAGE_LENGTH, "Message too long");

        vault.totalCollected += msg.value;
        totalLockedPrincipal += msg.value;

        vaultGreetings[_vaultId].push(Greeting({
            sender: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        }));

        emit ContributionReceived(_vaultId, msg.sender, msg.value, _message, vault.totalCollected);
    }

    /**
     * @notice Release the Birthday Gift + Yield to recipient upon timestamp unlock or Demo Mode
     * @param _vaultId Target Vault ID
     * @param _isDemoMode Set true to trigger Instant Demo Time Travel release during Hackathon demo
     */
    function releaseBirthdayGift(uint256 _vaultId, bool _isDemoMode) external nonReentrant {
        Vault storage vault = vaults[_vaultId];
        require(vault.id != 0, "Vault does not exist");
        require(!vault.isClaimed, "Vault already claimed");
        require(vault.totalCollected > 0, "No funds collected in vault");

        if (!_isDemoMode) {
            require(block.timestamp >= vault.birthdayTimestamp, "Birthday timestamp not reached yet");
        } else {
            require(demoModeEnabled, "Demo mode disabled");
            require(msg.sender == vault.creator || msg.sender == owner() || msg.sender == vault.recipient, "Unauthorized demo trigger");
        }

        vault.isClaimed = true;

        // Prorated 0.5% / 30 days bonus, paid only from the reserve (never from other vaults' principal).
        uint256 principal = vault.totalCollected;
        uint256 yieldBonus = calculateYieldBonus(principal, _accruedSeconds(vault));
        uint256 reserve = yieldReserve();
        if (yieldBonus > reserve) yieldBonus = reserve;
        uint256 payoutAmount = principal + yieldBonus;
        totalLockedPrincipal -= principal;

        uint256 mintedTokenId = 0;
        if (address(nftContract) != address(0)) {
            mintedTokenId = nftContract.mintMemoryBooklet(
                vault.recipient,
                vault.recipientName,
                payoutAmount,
                vaultGreetings[_vaultId].length,
                vault.birthdayTimestamp
            );
            vault.nftTokenId = mintedTokenId;
        }

        (bool success, ) = vault.recipient.call{value: payoutAmount}("");
        require(success, "Transfer to recipient failed");

        emit GiftClaimed(_vaultId, vault.recipient, principal, yieldBonus, payoutAmount, mintedTokenId);
    }

    /**
     * @notice Helper function to calculate prorated yield bonus (0.5% per 30 days)
     */
    function calculateYieldBonus(uint256 _principal, uint256 _durationSeconds) public pure returns (uint256) {
        if (_principal == 0) return 0;
        // 0.5% (50 basis points) per 30 days (2,592,000 seconds)
        return (_principal * 50 * _durationSeconds) / (10000 * 30 days);
    }

    /**
     * @notice Get all greetings for a vault
     */
    function getGreetings(uint256 _vaultId) external view returns (Greeting[] memory) {
        return vaultGreetings[_vaultId];
    }

    /**
     * @notice Get Vault details and remaining time
     */
    function getVaultDetails(uint256 _vaultId) external view returns (
        Vault memory vault,
        uint256 timeRemaining,
        uint256 currentYieldEstimate
    ) {
        vault = vaults[_vaultId];
        if (block.timestamp >= vault.birthdayTimestamp) {
            timeRemaining = 0;
        } else {
            timeRemaining = vault.birthdayTimestamp - block.timestamp;
        }
        currentYieldEstimate = calculateYieldBonus(vault.totalCollected, _accruedSeconds(vaults[_vaultId]));
    }

    // Anyone can top up the yield reserve by sending MON directly
    receive() external payable {}
}
