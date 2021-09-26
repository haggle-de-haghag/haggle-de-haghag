import React from 'react';
import {AppBar, Box, Container, Link, Toolbar, Typography} from "@material-ui/core/index";

export default function App(props: any) {
  return (
      <Container maxWidth="xl">
          <AppBar position="static" color="transparent" elevation={1}>
              <Toolbar>
                  <Typography variant="h6"><Link href="/" color="inherit">ハグルでハグハグ</Link></Typography>
              </Toolbar>
          </AppBar>
          <Box my={4}>
              {props.children}
          </Box>
      </Container>
  );
}
