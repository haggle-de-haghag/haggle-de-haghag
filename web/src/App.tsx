import React from 'react';
import {Box, Container} from "@material-ui/core/index";

export default function App(props: any) {
  return (
      <Container>
          <Box my={4}>
              {props.children}
          </Box>
      </Container>
  );
}
