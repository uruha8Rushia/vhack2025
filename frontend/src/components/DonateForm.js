import React, { useState } from "react";
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const DonateForm = ({ charityId, onDonate, onClose }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    onDonate(charityId, amount);
    setAmount("");
    onClose(); // Close modal after donation
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Donate to Charity</DialogTitle>
      <DialogContent>
        <TextField
          label="Amount (ETH)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          sx={{ my: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Donate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DonateForm;
