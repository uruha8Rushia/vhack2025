import React from "react";
import { Card, CardContent, Typography, Button, LinearProgress } from "@mui/material";

const CharityCard = ({ charity, onDonate }) => {
  const progress = (charity.fundsRaised / charity.goal) * 100;

  return (
    <Card sx={{ my: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6">{charity.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Goal: {charity.goal} ETH
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Raised: {charity.fundsRaised} ETH
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ my: 2 }} />
        <Button variant="contained" onClick={() => onDonate(charity.id)}>
          Donate
        </Button>
      </CardContent>
    </Card>
  );
};

export default CharityCard;
