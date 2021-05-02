import React from 'react';
import {Box, Container} from "@material-ui/core/index";
import {ProvideUIState} from "./state/uiState";

export default function App(props: any) {
  return (
      <ProvideUIState>
          <Container>
              <Box my={4}>
                  {props.children}
              </Box>
          </Container>
      </ProvideUIState>
  );
}
