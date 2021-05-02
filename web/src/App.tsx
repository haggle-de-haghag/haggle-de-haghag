import React from 'react';
import './App.css';
import {Box, Container, Typography} from "@material-ui/core/index";
import ProvideInMemoryGameState from "./state/inMemory";
import {ProvideUIState} from "./state/uiState";
import RuleList from "./materialized/RuleList";

export default function App() {
  return (
      <ProvideInMemoryGameState>
          <ProvideUIState>
              <Container>
                  <Box my={4}>
                      <Typography variant="h4">Haggle de haghag</Typography>
                  </Box>
                  <RuleList />
              </Container>
          </ProvideUIState>
      </ProvideInMemoryGameState>
  );
}
