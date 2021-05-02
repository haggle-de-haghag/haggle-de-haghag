import {ProvideInMemoryGameMasterState} from "../../state/inMemory";
import {Box, Grid, Typography} from "@material-ui/core/index";
import React, {useContext} from "react";
import {GameMasterStateContext} from "../../state/gameMasterState";
import {RuleEditor, RuleList} from "./materializedCompoents";

export default function GameMasterPage() {
    const [state, dispatch] = useContext(GameMasterStateContext);

    return (
        <ProvideInMemoryGameMasterState>
            <Grid container direction="column">
                <Grid item><Typography variant="h3">ゲームマスター</Typography></Grid>
                <Grid item container spacing={3}>
                    <Grid item xs={3}>
                        <Box><Typography variant="h6">ルール</Typography></Box>
                        <Box><RuleList /></Box>
                    </Grid>
                    <Grid item xs={6}><RuleEditor /></Grid>
                </Grid>
            </Grid>
        </ProvideInMemoryGameMasterState>
    )
}