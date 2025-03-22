import React, { useEffect, useState } from "react";
import { getDonations } from "../services/blockchain";

const CharityCard = ({ charity, onDonate }) => {
  const [donations, setDonations] = useState([]);
  const progress = (charity.fundsRaised / charity.goal) * 100;

  useEffect(() => {
    const loadDonations = async () => {
      const donations = await getDonations(charity.id);
      setDonations(donations);
    };
    loadDonations();
  }, [charity.id]);

  return (
    <div className="charity-card">
      <h3>{charity.name}</h3>
      <p>Goal: {charity.goal} ETH</p>
      <p>Raised: {charity.fundsRaised} ETH</p>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="transaction-history">
        <h4>Recent Donations</h4>
        {donations.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation, index) => (
                <tr key={index}>
                  <td>{`${donation.donor.slice(0, 6)}...${donation.donor.slice(-4)}`}</td>
                  <td>{donation.amount} ETH</td>
                  <td>{new Date(donation.timestamp * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No donations yet</p>
        )}
      </div>

      <button className="donate-button" onClick={() => onDonate(charity.id)}>
        Donate
      </button>
    </div>
  );
};

export default CharityCard;
