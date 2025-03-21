import React, { useState } from "react";

const DonateForm = ({ charityId, onDonate, onClose }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    onDonate(charityId, amount);
    setAmount("");
    onClose(); // Close modal after donation
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Donate to Charity</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Enter amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <div className="button-group">
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="donate">
              Donate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonateForm;
