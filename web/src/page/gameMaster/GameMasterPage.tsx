import {Box, Button, Grid, Typography} from "@material-ui/core/index";
import React from "react";
import {RuleEditor, RuleList} from "./materializedCompoents";
import {useGMDispatch} from "../../state/gameMasterState";

export default function GameMasterPage() {
    const dispatch = useGMDispatch();

    const onNewRuleClick = () => dispatch({
        type: 'CreateRule',
        title: '（新規ルール）',
        text: '',
        accessList: [],
    });

    return (
        <Grid container direction="column">
            <Grid item><Typography variant="h3">ゲームマスター</Typography></Grid>
            <Grid item container spacing={3}>
                <Grid item xs={3}>
                    <Box><Typography variant="h6">ルール</Typography></Box>
                    <Box><RuleList /></Box>
                    <Box><Button variant="contained" onClick={onNewRuleClick}>新規ルール</Button></Box>
                </Grid>
                <Grid item xs={9}><RuleEditor /></Grid>
            </Grid>
        </Grid>
    )
}