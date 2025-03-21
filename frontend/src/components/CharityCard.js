import React from "react";

const CharityCard = ({ charity, onDonate }) => {
  const progress = (charity.fundsRaised / charity.goal) * 100;

  return (
    <div className="charity-card">
      <h3>{charity.name}</h3>
      <p>Goal: {charity.goal} ETH</p>
      <p>Raised: {charity.fundsRaised} ETH</p>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <button className="donate-button" onClick={() => onDonate(charity.id)}>
        Donate
      </button>
    </div>
  );
};

export default CharityCard;
