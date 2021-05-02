import {GameStateContext} from "../state/gameState";
import React, {useContext} from "react";
import RuleList from "../materialized/RuleList";
import RuleView from "../materialized/RuleView";
import {Box, Container, Grid, Typography} from "@material-ui/core/index";
import ShareRulePane from "../materialized/ShareRulePane";

export default function PlayerPage() {
    const [gameState, gsDispatch] = useContext(GameStateContext);

    return <Grid container direction="column" spacing={2}>
        <Grid item><Typography variant="h3">進行中 - {gameState.game.title}</Typography></Grid>
        <Grid item container spacing={3}>
            <Grid item xs={3}>
                <Box><Typography variant="h6">知ってるルール</Typography></Box>
                <Box><RuleList /></Box>
            </Grid>
            <Grid item xs={6}><RuleView /></Grid>
            <Grid item xs={3}><ShareRulePane /></Grid>
        </Grid>
    </Grid>;
}