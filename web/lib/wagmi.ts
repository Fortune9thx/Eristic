"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const bradbury = defineChain({
  id: 4221,
  name: "GenLayer Bradbury Testnet",
  nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-bradbury.genlayer.com"] },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Bradbury Explorer",
      url: "https://explorer-bradbury.genlayer.com",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "ERISTIC",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "eristic",
  chains: [bradbury],
  ssr: true,
});
