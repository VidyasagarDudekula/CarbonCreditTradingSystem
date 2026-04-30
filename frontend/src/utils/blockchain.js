import { ethers } from "ethers";
import config from "../deployed-config.json";

export async function getBlockchainConfig() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }

  // Request account access
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Load contract
  const contract = new ethers.Contract(config.address, config.abi, signer);

  return { provider, signer, contract, address: await signer.getAddress() };
}
