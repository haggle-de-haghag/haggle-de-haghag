import React from 'react';
import {Box, Container } from "@material-ui/core/index";
import {ProvideInMemoryGameState} from "./state/inMemory";
import {ProvideUIState} from "./state/uiState";
import PlayerPage from "./page/PlayerPage";

export default function App() {
  return (
      <ProvideInMemoryGameState>
          <ProvideUIState>
              <Container>
                  <Box my={4}>
                      <PlayerPage />
                  </Box>
              </Container>
          </ProvideUIState>
      </ProvideInMemoryGameState>
  );
}
