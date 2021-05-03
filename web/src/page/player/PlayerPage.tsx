import React from "react";
import {Box, Grid, Typography} from "@material-ui/core/index";
import {usePLSelector} from "../../state/playerState";
import {RuleList, RuleView, ShareRulePane} from "./materializedComponents";

export default function PlayerPage() {
    const { gameTitle } = usePLSelector((state) => ({
        gameTitle: state.gameTitle,
    }));

    return <Grid container direction="column" spacing={2}>
        <Grid item><Typography variant="h3">{gameTitle}</Typography></Grid>
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