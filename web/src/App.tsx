import React from 'react';
import {Box, Container} from "@material-ui/core/index";
import {ProvideInMemoryGameState} from "./state/inMemory";
import {ProvideUIState} from "./state/uiState";

export default function App(props: any) {
  return (
      <ProvideInMemoryGameState>
          <ProvideUIState>
              <Container>
                  <Box my={4}>
                      {props.children}
                  </Box>
              </Container>
          </ProvideUIState>
      </ProvideInMemoryGameState>
  );
}
