// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title MonadBirthdayNFT
 * @notice On-Chain Dynamic SVG NFT Memory Booklet for MonadWishes Birthday Vaults.
 * @dev Generates 100% on-chain SVG vector artwork with Monad purple gradient aesthetic.
 */
contract MonadBirthdayNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;
    address public vaultContract;

    struct BookletData {
        string recipientName;
        uint256 totalCollected;
        uint256 contributorCount;
        uint256 unlockTimestamp;
    }

    mapping(uint256 => BookletData) public bookletData;

    event NFTMinted(uint256 indexed tokenId, address indexed recipient, string recipientName, uint256 totalCollected);

    modifier onlyVault() {
        require(msg.sender == vaultContract || msg.sender == owner(), "Caller is not Vault contract");
        _;
    }

    constructor(address initialOwner) ERC721("MonadWishes Memory Booklet", "MWISH") Ownable(initialOwner) {}

    function setVaultContract(address _vaultContract) external onlyOwner {
        vaultContract = _vaultContract;
    }

    function mintMemoryBooklet(
        address recipient,
        string memory recipientName,
        uint256 totalCollected,
        uint256 contributorCount,
        uint256 unlockTimestamp
    ) external onlyVault returns (uint256) {
        _nextTokenId++;
        uint256 newTokenId = _nextTokenId;

        bookletData[newTokenId] = BookletData({
            recipientName: recipientName,
            totalCollected: totalCollected,
            contributorCount: contributorCount,
            unlockTimestamp: unlockTimestamp
        });

        // _mint, not _safeMint: a contract wallet without onERC721Received must not block the gift payout.
        _mint(recipient, newTokenId);

        emit NFTMinted(newTokenId, recipient, recipientName, totalCollected);
        return newTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        BookletData memory data = bookletData[tokenId];

        string memory formattedAmount = formatMon(data.totalCollected);

        string memory svg = generateSVG(data.recipientName, formattedAmount, data.contributorCount.toString());

        string memory json = Base64.encode(
            bytes(
                abi.encodePacked(
                    '{"name": "MonadWishes Booklet #',
                    tokenId.toString(),
                    ' - ',
                    data.recipientName,
                    '", "description": "Official MonadWishes Birthday Memory Booklet & Social Yield Pool Record on Monad Blockchain.", ',
                    '"attributes": [',
                    '{"trait_type": "Recipient", "value": "',
                    data.recipientName,
                    '"}, ',
                    '{"trait_type": "Total MON Collected", "value": "',
                    formattedAmount,
                    ' MON"}, ',
                    '{"trait_type": "Contributors", "value": ',
                    data.contributorCount.toString(),
                    "}], ",
                    '"image": "data:image/svg+xml;base64,',
                    Base64.encode(bytes(svg)),
                    '"}'
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /// @notice Formats wei as MON with two decimals, e.g. 1.05 ether -> "1.05".
    function formatMon(uint256 amountWei) public pure returns (string memory) {
        uint256 cents = (amountWei % 1e18) / 1e16;
        return string(abi.encodePacked((amountWei / 1e18).toString(), cents < 10 ? ".0" : ".", cents.toString()));
    }

    function generateSVG(
        string memory recipientName,
        string memory formattedAmount,
        string memory contributorCount
    ) public pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">',
                '<defs>',
                '<linearGradient id="monadGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" stop-color="#200052"/>',
                '<stop offset="50%" stop-color="#836EF9"/>',
                '<stop offset="100%" stop-color="#00E5FF"/>',
                '</linearGradient>',
                '<filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
                '</defs>',
                '<rect width="400" height="500" rx="24" fill="url(#monadGrad)"/>',
                '<rect x="15" y="15" width="370" height="470" rx="18" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2"/>',
                '<text x="200" y="70" font-family="sans-serif" font-size="14" font-weight="bold" fill="#00E5FF" letter-spacing="3" text-anchor="middle">MONAD WISHES</text>',
                unicode'<text x="200" y="100" font-family="sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">🎂 Happy Birthday!</text>',
                '<circle cx="200" cy="180" r="45" fill="#FFFFFF" fill-opacity="0.1" stroke="#00E5FF" stroke-width="2" filter="url(#glow)"/>',
                unicode'<text x="200" y="190" font-family="sans-serif" font-size="40" text-anchor="middle">🎁</text>',
                '<text x="200" y="260" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">',
                recipientName,
                '</text>',
                '<rect x="40" y="290" width="320" height="80" rx="12" fill="#000000" fill-opacity="0.3" stroke="#836EF9" stroke-width="1.5"/>',
                '<text x="200" y="320" font-family="sans-serif" font-size="12" fill="#A0A0B0" text-anchor="middle">TOTAL GIFT POOL + YIELD</text>',
                '<text x="200" y="352" font-family="sans-serif" font-size="24" font-weight="bold" fill="#00E5FF" filter="url(#glow)" text-anchor="middle">',
                formattedAmount,
                ' MON</text>',
                unicode'<text x="200" y="420" font-family="sans-serif" font-size="13" fill="#FFFFFF" fill-opacity="0.8" text-anchor="middle">👥 Contributed by ',
                contributorCount,
                ' Friends</text>',
                unicode'<text x="200" y="455" font-family="sans-serif" font-size="10" fill="#A0A0B0" text-anchor="middle">Verified on Monad Blockchain • 0.3s Block Time</text>',
                '</svg>'
            )
        );
    }
}
