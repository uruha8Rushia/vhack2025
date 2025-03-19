import React, { useState, useEffect } from "react";
import CharityCard from "./components/CharityCard";
import DonateForm from "./components/DonateForm";
import { Button, Container, Typography, CircularProgress } from "@mui/material";
import { ethers } from "ethers";
import { connectWallet, getContract } from "./services/blockchain";

function App() {
  const [charities, setCharities] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch charities from blockchain
  const fetchCharities = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
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
      console.error("Error fetching charities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle donation
  const handleDonate = async (charityId, amount) => {
    try {
      const contract = await getContract();
      const tx = await contract.donate(charityId, {
        value: ethers.utils.parseEther(amount), // ✅ Updated for Ethers v5
      });
      await tx.wait();
      fetchCharities(); // Refresh data after donation
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
    fetchCharities();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 3 }}>
        Charity Platform
      </Typography>

      {!currentAccount ? (
        <Button variant="contained" onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Typography>Connected: {currentAccount.slice(0, 6)}...</Typography>
      )}

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
      ) : (
        charities.map((charity) => (
          <CharityCard
            key={charity.id}
            charity={charity}
            onDonate={(id) => setSelectedCharityId(id)}
          />
        ))
      )}

      {selectedCharityId !== null && (
        <DonateForm
          charityId={selectedCharityId}
          onDonate={handleDonate}
          onClose={() => setSelectedCharityId(null)}
        />
      )}
    </Container>
  );
}

export default App;
