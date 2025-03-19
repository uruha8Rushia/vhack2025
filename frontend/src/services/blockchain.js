import { ethers } from "ethers";
import CharityManagerABI from "../contracts/CharityManager.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Local Hardhat node

// Connect to MetaMask
export const connectWallet = async () => {
  if (window.ethereum) {
    // Verify network
    let chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId, 16) !== 31337) {
      // Try to add Hardhat network to MetaMask
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7A69', // 31337 in hex
          chainName: 'Hardhat Local Network',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['http://127.0.0.1:8545'],
          blockExplorerUrls: []
        }]
      });
      // Request network switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }],
      });
      chainId = await window.ethereum.request({ method: 'eth_chainId' });
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log('Connected to contract at:', contractAddress);
    return { provider, signer, address };
  } else {
    alert("Please install MetaMask!");
    return null;
  }
};

// Initialize contract
export const getContract = async () => {
  try {
    const { provider } = await connectWallet();
    const contract = new ethers.Contract(
      contractAddress,
      CharityManagerABI.abi,
      provider.getSigner()
    );
    // Verify contract connection
    const charityCount = await contract.charityCount();
    console.log('Contract connection verified - Total charities:', charityCount.toString());
    return contract;
  } catch (error) {
    console.error('Contract connection failed:', error);
    throw new Error(`Failed to connect to contract: ${error.message}`);
  }
};