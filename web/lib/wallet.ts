"use client";

import { getWalletClient as wagmiGetWalletClient, writeContract, getAccount } from "@wagmi/core";
import { wagmiConfig, bradbury } from "./wagmi";
import { ADDRS } from "./contracts";
import { trackTx } from "./txQueue";

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const { address } = getAccount(wagmiConfig);
    return address ?? null;
  } catch {
    return null;
  }
}

export async function getWalletClient() {
  const { address } = getAccount(wagmiConfig);
  if (!address) throw new Error("Wallet not connected");
  return wagmiGetWalletClient(wagmiConfig, { chainId: bradbury.id });
}

// --- write helpers ------------------------------------------------------

export async function createClaim(statement: string, argument: string, evidence: string) {
  const preview = statement.slice(0, 40) + (statement.length > 40 ? "…" : "");
  return trackTx("create_claim", `file claim · "${preview}"`, () =>
    writeContract(wagmiConfig, {
      address: ADDRS.registry as `0x${string}`,
      abi: [{ name: "create_claim", type: "function", inputs: [{ type: "string" }, { type: "string" }, { type: "string" }], outputs: [], stateMutability: "nonpayable" }],
      functionName: "create_claim",
      args: [statement, argument, evidence],
    })
  );
}

export async function stake(claimId: number, side: "FOR" | "AGAINST", amountWei: bigint) {
  const fnName = side === "FOR" ? "stake_for_claim" : "stake_against_claim";
  return trackTx(
    side === "FOR" ? "stake_for" : "stake_against",
    `stake ${side} · #${claimId} · ${(Number(amountWei) / 1e18).toFixed(2)} GEN`,
    () =>
      writeContract(wagmiConfig, {
        address: ADDRS.stakeManager as `0x${string}`,
        abi: [{ name: fnName, type: "function", inputs: [{ type: "uint256" }], outputs: [], stateMutability: "payable" }],
        functionName: fnName,
        args: [BigInt(claimId)],
        value: amountWei,
      })
  );
}

export async function challenge(claimId: number, counterArg: string, counterEvidence: string) {
  return trackTx("challenge", `challenge · #${claimId}`, () =>
    writeContract(wagmiConfig, {
      address: ADDRS.registry as `0x${string}`,
      abi: [{ name: "challenge", type: "function", inputs: [{ type: "uint256" }, { type: "string" }, { type: "string" }], outputs: [], stateMutability: "nonpayable" }],
      functionName: "challenge",
      args: [BigInt(claimId), counterArg, counterEvidence],
    })
  );
}

export async function addEvidence(claimId: number, side: "FOR" | "AGAINST", evidence: string, argument: string) {
  return trackTx("other", `add evidence ${side} · #${claimId}`, () =>
    writeContract(wagmiConfig, {
      address: ADDRS.registry as `0x${string}`,
      abi: [{ name: "add_evidence", type: "function", inputs: [{ type: "uint256" }, { type: "string" }, { type: "string" }, { type: "string" }], outputs: [], stateMutability: "nonpayable" }],
      functionName: "add_evidence",
      args: [BigInt(claimId), side, evidence, argument],
    })
  );
}

export async function submitForReview(claimId: number) {
  return trackTx("submit_for_review", `submit for review · #${claimId}`, () =>
    writeContract(wagmiConfig, {
      address: ADDRS.registry as `0x${string}`,
      abi: [{ name: "submit_for_review", type: "function", inputs: [{ type: "uint256" }], outputs: [], stateMutability: "nonpayable" }],
      functionName: "submit_for_review",
      args: [BigInt(claimId)],
    })
  );
}

export async function adjudicate(claimId: number) {
  return trackTx("adjudicate", `adjudicate · #${claimId}`, () =>
    writeContract(wagmiConfig, {
      address: ADDRS.adjudication as `0x${string}`,
      abi: [{ name: "adjudicate", type: "function", inputs: [{ type: "uint256" }], outputs: [], stateMutability: "nonpayable" }],
      functionName: "adjudicate",
      args: [BigInt(claimId)],
    })
  );
}

export async function tipClaim(claimId: number, amountWei: bigint) {
  return trackTx(
    "other",
    `tip · #${claimId} · ${(Number(amountWei) / 1e18).toFixed(2)} GEN`,
    () =>
      writeContract(wagmiConfig, {
        address: ADDRS.registry as `0x${string}`,
        abi: [{ name: "tip_claim", type: "function", inputs: [{ type: "uint256" }], outputs: [], stateMutability: "payable" }],
        functionName: "tip_claim",
        args: [BigInt(claimId)],
        value: amountWei,
      })
  );
}

export function parseGen(input: string): bigint {
  if (!input.trim()) return 0n;
  const [whole, frac = ""] = input.trim().split(".");
  const padded = (frac + "000000000000000000").slice(0, 18);
  return BigInt(whole || "0") * 10n ** 18n + BigInt(padded || "0");
}
