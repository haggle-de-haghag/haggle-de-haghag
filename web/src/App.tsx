import React from 'react';
import './App.css';
import {Box, Container, Grid, Typography} from "@material-ui/core/index";
import ProvideInMemoryGameState from "./state/inMemory";
import {ProvideUIState} from "./state/uiState";
import RuleList from "./materialized/RuleList";
import RuleView from "./materialized/RuleView";

export default function App() {
  return (
      <ProvideInMemoryGameState>
          <ProvideUIState>
              <Container>
                  <Box my={4}>
                      <Typography variant="h4">Haggle de haghag</Typography>
                  </Box>
                  <Grid container spacing={3}>
                      <Grid item xs={4}><RuleList /></Grid>
                      <Grid item><RuleView /></Grid>
                  </Grid>
              </Container>
          </ProvideUIState>
      </ProvideInMemoryGameState>
  );
}
