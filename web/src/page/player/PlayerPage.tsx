import React from "react";
import {Box, Divider, Grid, Snackbar, Typography} from "@material-ui/core/index";
import {usePLSelector} from "../../state/playerState";
import {
    GiveTokenPane,
    RuleList,
    RuleView,
    ShareRulePane,
    TokenList,
    TokenView,
    useSelectedToken
} from "./materializedComponents";
import { Alert } from "@material-ui/lab";

export default function PlayerPage() {
    const { gameTitle, errorMessage, notification } = usePLSelector((state) => ({
        gameTitle: state.gameTitle,
        errorMessage: state.errorMessage,
        notification: state.notification,
    }));

    return <Grid container direction="column" spacing={2}>
        <Grid item><Typography variant="h3">{gameTitle}</Typography></Grid>
        <Grid item container spacing={3}>
            <Grid item xs={3}>
                <Box><RuleList /></Box>
                <Box><TokenList /></Box>
            </Grid>
            <Grid item xs={6} container direction="column" spacing={4}>
                <Grid item><RuleView /></Grid>
                <IfTokenSelected>
                    <Grid item><TokenView /></Grid>
                    <Divider />
                    <Grid item><GiveTokenPane /></Grid>
                </IfTokenSelected>
            </Grid>
            <Grid item xs={3}><ShareRulePane /></Grid>
        </Grid>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={errorMessage !== undefined}>
            <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={notification !== undefined}
            message={notification} />
    </Grid>;
}

function IfTokenSelected(props: { children: JSX.Element[] }) {
    const { token } = useSelectedToken();
    if (token === undefined) {
        return null;
    }
    return <>{props.children}</>;
}