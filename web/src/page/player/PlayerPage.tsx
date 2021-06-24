import React from "react";
import {Box, CircularProgress, Divider, Grid, makeStyles, Snackbar, Typography} from "@material-ui/core/index";
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

const useStyles = makeStyles((theme) => ({
    menu: {
        overflowY: 'scroll',
        height: 'calc(100vh - 200px)',
        paddingTop: '0 !important',
    },
}));

export default function PlayerPage() {
    const { player, gameTitle, errorMessage, notification, updating } = usePLSelector((state) => ({
        player: state.player,
        gameTitle: state.gameTitle,
        errorMessage: state.errorNotification.message,
        notification: state.notification.message,
        updating: state.updating,
    }));
    const classes = useStyles();

    return <Grid container direction="column" spacing={2}>
        <Grid item container alignItems="center">
            <Grid item><Typography variant="h3">{player.displayName} - {gameTitle}</Typography></Grid>
            <Grid item>{updating && <CircularProgress />}</Grid>
        </Grid>
        <Grid item container spacing={3}>
            <Grid item xs={3} className={classes.menu}>
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