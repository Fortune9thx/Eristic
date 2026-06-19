"use client";

import { ConnectButton as RKConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectButton() {
  return (
    <RKConnectButton
      accountStatus="address"
      chainStatus="none"
      showBalance={{ smallScreen: false, largeScreen: true }}
      label="Connect Wallet"
    />
  );
}
