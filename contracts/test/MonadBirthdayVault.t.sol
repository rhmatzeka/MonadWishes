// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MonadBirthdayNFT.sol";
import "../src/MonadBirthdayVault.sol";

contract MonadBirthdayVaultTest is Test {
    MonadBirthdayNFT public nft;
    MonadBirthdayVault public vault;

    address public owner = address(1);
    address payable public recipient = payable(address(2));
    address public contributor1 = address(3);
    address public contributor2 = address(4);

    function setUp() public {
        vm.startPrank(owner);
        nft = new MonadBirthdayNFT(owner);
        vault = new MonadBirthdayVault(address(nft), owner);
        nft.setVaultContract(address(vault));
        vm.stopPrank();

        // Fund contributors with MON
        vm.deal(contributor1, 100 ether);
        vm.deal(contributor2, 100 ether);
        vm.deal(address(vault), 10 ether); // Reserve for yield bonus
    }

    function test_CreateVault() public {
        vm.prank(contributor1);
        uint256 vaultId = vault.createVault(recipient, "Alice", 30, 10 ether);

        assertEq(vaultId, 1);

        (MonadBirthdayVault.Vault memory v, uint256 timeRemaining, ) = vault.getVaultDetails(vaultId);

        assertEq(v.recipient, recipient);
        assertEq(v.recipientName, "Alice");
        assertEq(v.targetAmount, 10 ether);
        assertEq(v.totalCollected, 0);
        assertFalse(v.isClaimed);
        assertGt(timeRemaining, 29 days);
    }

    function test_ContributeAndGreetings() public {
        vm.prank(contributor1);
        uint256 vaultId = vault.createVault(recipient, "Alice", 30, 10 ether);

        vm.prank(contributor1);
        vault.contribute{value: 2 ether}(vaultId, "Happy Birthday Alice! From Bob");

        vm.prank(contributor2);
        vault.contribute{value: 3 ether}(vaultId, "Best wishes Alice! From Charlie");

        (MonadBirthdayVault.Vault memory v, , ) = vault.getVaultDetails(vaultId);
        assertEq(v.totalCollected, 5 ether);

        MonadBirthdayVault.Greeting[] memory greetings = vault.getGreetings(vaultId);
        assertEq(greetings.length, 2);
        assertEq(greetings[0].sender, contributor1);
        assertEq(greetings[0].amount, 2 ether);
        assertEq(greetings[0].message, "Happy Birthday Alice! From Bob");
    }

    function test_ReleaseGiftDemoMode() public {
        vm.prank(contributor1);
        uint256 vaultId = vault.createVault(recipient, "Alice", 30, 10 ether);

        vm.prank(contributor1);
        vault.contribute{value: 5 ether}(vaultId, "Happy Birthday!");

        uint256 initialBalance = recipient.balance;

        // Trigger Demo Mode Release
        vm.prank(contributor1);
        vault.releaseBirthdayGift(vaultId, true);

        (MonadBirthdayVault.Vault memory v, , ) = vault.getVaultDetails(vaultId);
        assertTrue(v.isClaimed);
        assertGt(recipient.balance, initialBalance);
        assertEq(nft.balanceOf(recipient), 1);

        // Verify NFT metadata URI works and returns base64 JSON with SVG
        uint256 tokenId = v.nftTokenId;
        string memory strokeURI = nft.tokenURI(tokenId);
        assertGt(bytes(strokeURI).length, 100);
    }

    function test_ReleaseGiftTimeTravel() public {
        vm.prank(contributor1);
        uint256 vaultId = vault.createVault(recipient, "Alice", 30, 10 ether);

        vm.prank(contributor1);
        vault.contribute{value: 5 ether}(vaultId, "Happy Birthday!");

        // Time travel 31 days into future
        vm.warp(block.timestamp + 31 days);

        uint256 initialBalance = recipient.balance;

        vm.prank(recipient);
        vault.releaseBirthdayGift(vaultId, false);

        (MonadBirthdayVault.Vault memory v, , ) = vault.getVaultDetails(vaultId);
        assertTrue(v.isClaimed);
        assertGt(recipient.balance, initialBalance);
        assertEq(nft.balanceOf(recipient), 1);
    }
}
