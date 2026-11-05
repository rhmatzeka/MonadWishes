// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MonadBirthdayNFT.sol";
import "../src/MonadBirthdayVault.sol";

contract RejectsNFT {
    receive() external payable {}
}

contract MonadBirthdayVaultFixesTest is Test {
    MonadBirthdayNFT nft;
    MonadBirthdayVault vault;

    address owner = address(1);
    address payable alice = payable(address(0xA11CE));
    address payable bob = payable(address(0xB0B));
    address friend = address(0xF1);

    function setUp() public {
        vm.startPrank(owner);
        nft = new MonadBirthdayNFT(owner);
        vault = new MonadBirthdayVault(address(nft), owner);
        nft.setVaultContract(address(vault));
        vm.stopPrank();
        vm.deal(friend, 100 ether);
    }

    function _vaultWith(address payable to, string memory name, uint256 amount) internal returns (uint256 id) {
        vm.prank(friend);
        id = vault.createVault(to, name, 30, 10 ether);
        vm.prank(friend);
        vault.contribute{value: amount}(id, "hbd");
    }

    // Bug: yield for one vault was paid out of another vault's principal.
    function test_YieldNeverTakenFromOtherVaults() public {
        uint256 a = _vaultWith(alice, "Alice", 5 ether);
        uint256 b = _vaultWith(bob, "Bob", 5 ether);

        vm.warp(block.timestamp + 31 days);
        vault.releaseBirthdayGift(a, false);
        assertEq(alice.balance, 5 ether, "no reserve: alice gets principal only");

        vault.releaseBirthdayGift(b, false);
        assertEq(bob.balance, 5 ether, "bob principal must be intact");
        assertEq(address(vault).balance, 0);
        assertEq(vault.totalLockedPrincipal(), 0);
    }

    function test_YieldPaidFromReserveAndCappedAtBirthday() public {
        uint256 a = _vaultWith(alice, "Alice", 6 ether);
        vm.deal(address(vault), address(vault).balance + 1 ether); // protocol reserve
        assertEq(vault.yieldReserve(), 1 ether);

        // Claim long after the birthday: yield must stop at the birthday (30 days).
        vm.warp(block.timestamp + 365 days);
        vault.releaseBirthdayGift(a, false);
        uint256 expectedYield = vault.calculateYieldBonus(6 ether, 30 days); // 0.03 MON
        assertEq(alice.balance, 6 ether + expectedYield);
        assertEq(vault.yieldReserve(), 1 ether - expectedYield);
    }

    function test_DemoModeCanBeDisabledByOwner() public {
        uint256 a = _vaultWith(alice, "Alice", 1 ether);
        assertTrue(vault.demoModeEnabled());

        vm.prank(friend);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, friend));
        vault.setDemoMode(false);

        vm.prank(owner);
        vault.setDemoMode(false);

        vm.prank(friend); // creator
        vm.expectRevert(bytes("Demo mode disabled"));
        vault.releaseBirthdayGift(a, true);
    }

    function test_DemoModeRejectsStrangers() public {
        uint256 a = _vaultWith(alice, "Alice", 1 ether);
        vm.prank(address(0xBAD));
        vm.expectRevert(bytes("Unauthorized demo trigger"));
        vault.releaseBirthdayGift(a, true);
    }

    // Bug: _safeMint made release revert forever for contract recipients without onERC721Received.
    function test_ReleaseWorksForContractRecipient() public {
        RejectsNFT wallet = new RejectsNFT();
        uint256 a = _vaultWith(payable(address(wallet)), "Safe", 2 ether);
        vm.warp(block.timestamp + 31 days);
        vault.releaseBirthdayGift(a, false);
        assertEq(address(wallet).balance, 2 ether);
        assertEq(nft.ownerOf(1), address(wallet));
    }

    function test_RejectsUnsafeRecipientName() public {
        vm.startPrank(friend);
        vm.expectRevert(bytes("Invalid recipient name"));
        vault.createVault(alice, 'Al"ice', 30, 1 ether);
        vm.expectRevert(bytes("Invalid recipient name"));
        vault.createVault(alice, "<script>", 30, 1 ether);
        vm.expectRevert(bytes("Invalid recipient name"));
        vault.createVault(alice, "", 30, 1 ether);
        vm.expectRevert(bytes("Invalid recipient name"));
        vault.createVault(alice, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", 30, 1 ether);
        vm.stopPrank();
    }

    function test_RejectsOverlongMessage() public {
        vm.prank(friend);
        uint256 a = vault.createVault(alice, "Alice", 30, 1 ether);
        bytes memory long = new bytes(281);
        for (uint256 i; i < long.length; i++) long[i] = "a";
        vm.prank(friend);
        vm.expectRevert(bytes("Message too long"));
        vault.contribute{value: 1 ether}(a, string(long));
    }

    function test_NftAmountKeepsLeadingZeroDecimals() public {
        uint256 a = _vaultWith(alice, "Alice", 1.05 ether);
        vm.warp(block.timestamp + 31 days);
        vault.releaseBirthdayGift(a, false);
        string memory svg = nft.generateSVG("Alice", nft.formatMon(1.05 ether), "1");
        assertTrue(_contains(svg, "1.05 MON"));
        assertEq(nft.formatMon(1 ether), "1.00");
        assertEq(nft.formatMon(12.345 ether), "12.34");
    }

    // Bug: contribute() called the staking precompile with a bad selector. A failing call burns
    // 63/64 of the gas it is given, which made eth_estimateGas return ~148M on Monad.
    function test_ContributeIgnoresFailingPrecompile() public {
        vm.etch(address(0x1000), hex"fe"); // INVALID: consumes all forwarded gas
        vm.prank(friend);
        uint256 a = vault.createVault(alice, "Alice", 30, 1 ether);

        vm.prank(friend);
        vault.contribute{value: 1 ether, gas: 300_000}(a, "hbd");

        (MonadBirthdayVault.Vault memory v, , ) = vault.getVaultDetails(a);
        assertEq(v.totalCollected, 1 ether);
    }

    function test_ContributeNeverCallsPrecompile() public {
        vm.prank(friend);
        uint256 a = vault.createVault(alice, "Alice", 30, 1 ether);

        vm.expectCall(address(0x1000), "", 0);
        vm.prank(friend);
        vault.contribute{value: 1 ether}(a, "hbd");
    }

    function _contains(string memory hay, string memory needle) internal pure returns (bool) {
        bytes memory h = bytes(hay);
        bytes memory n = bytes(needle);
        if (n.length > h.length) return false;
        for (uint256 i; i <= h.length - n.length; i++) {
            bool ok = true;
            for (uint256 j; j < n.length; j++) {
                if (h[i + j] != n[j]) { ok = false; break; }
            }
            if (ok) return true;
        }
        return false;
    }
}
