import React, { useState, useEffect } from "react";
import CharityCard from "./components/CharityCard";
import DonateForm from "./components/DonateForm";
import AdminPanel from "./components/AdminPanel";
import { ethers } from "ethers";
import { connectWallet, getContract } from "./services/blockchain";

function App() {
  const [charities, setCharities] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(""); // Used in AdminPanel component

  // Fetch charities and owner from blockchain
  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      const contract = await getContract();

      // Get owner address
      const contractOwner = await contract.owner();
      setOwner(contractOwner);

      // Get charities
      const count = await contract.charityCount();
      const charityList = [];

      for (let i = 0; i < count; i++) {
        const charity = await contract.charities(i);
        charityList.push({
          id: i,
          name: charity.name,
          goal: ethers.utils.formatEther(charity.goal),
          fundsRaised: ethers.utils.formatEther(charity.fundsRaised),
        });
      }

      setCharities(charityList);
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle donation
  const handleDonate = async (charityId, amount) => {
    try {
      const contract = await getContract();
      const tx = await contract.donate(charityId, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      fetchBlockchainData(); // Refresh data after donation
    } catch (error) {
      console.error("Donation failed:", error);
    }
  };

  // Connect wallet on load
  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) setCurrentAccount(accounts[0]);
      }
    };
    checkWallet();
    fetchBlockchainData();
  }, []);

  return (
    <div className="container">
      <h1>Charity Platform</h1>

      {!currentAccount ? (
        <button className="connect-wallet" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <p>Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p>
      )}

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {currentAccount.toLowerCase() === owner.toLowerCase() && (
            <AdminPanel ownerAddress={owner} currentAccount={currentAccount} />
          )}
          <div className="charity-list">
            {charities.map((charity) => (
              <CharityCard
                key={charity.id}
                charity={charity}
                onDonate={(id) => setSelectedCharityId(id)}
              />
            ))}
          </div>
        </>
      )}

      {selectedCharityId !== null && (
        <DonateForm
          charityId={selectedCharityId}
          onDonate={handleDonate}
          onClose={() => setSelectedCharityId(null)}
        />
      )}
    </div>
  );
}

export default App;
