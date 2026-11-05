/*
 * Envio HyperIndex Event Handlers for MonadWishes
 */

import { MonadBirthdayVault } from "../generated/src/Handlers.gen";

MonadBirthdayVault.VaultCreated.handler(async ({ event, context }) => {
  const entity = {
    id: event.params.vaultId.toString(),
    vaultId: event.params.vaultId,
    creator: event.params.creator,
    recipient: event.params.recipient,
    recipientName: event.params.recipientName,
    targetAmount: event.params.targetAmount,
    birthdayTimestamp: event.params.birthdayTimestamp,
    totalCollected: 0n,
    isClaimed: false,
    createdAt: BigInt(event.block.timestamp),
  };

  context.VaultEntity.set(entity);
});

MonadBirthdayVault.ContributionReceived.handler(async ({ event, context }) => {
  const contributionId = `${event.params.vaultId.toString()}-${event.transaction.hash}-${event.logIndex}`;

  const contribution = {
    id: contributionId,
    vaultId: event.params.vaultId,
    contributor: event.params.contributor,
    amount: event.params.amount,
    message: event.params.message,
    totalCollected: event.params.totalCollected,
    timestamp: BigInt(event.block.timestamp),
    txHash: event.transaction.hash,
  };

  context.ContributionEntity.set(contribution);

  const existingVault = await context.VaultEntity.get(event.params.vaultId.toString());
  if (existingVault) {
    context.VaultEntity.set({
      ...existingVault,
      totalCollected: event.params.totalCollected,
    });
  }
});

MonadBirthdayVault.GiftClaimed.handler(async ({ event, context }) => {
  const claimId = `${event.params.vaultId.toString()}-claimed`;

  const claim = {
    id: claimId,
    vaultId: event.params.vaultId,
    recipient: event.params.recipient,
    principalAmount: event.params.principalAmount,
    yieldBonus: event.params.yieldBonus,
    totalPayout: event.params.totalPayout,
    nftTokenId: event.params.nftTokenId,
    txHash: event.transaction.hash,
  };

  context.GiftClaimEntity.set(claim);

  const existingVault = await context.VaultEntity.get(event.params.vaultId.toString());
  if (existingVault) {
    context.VaultEntity.set({
      ...existingVault,
      isClaimed: true,
    });
  }
});
