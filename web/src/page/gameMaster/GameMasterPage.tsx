import {Box, Button, Grid, Paper, Typography} from "@material-ui/core/index";
import React from "react";
import {RuleEditor, RuleList} from "./materializedCompoents";
import {actions, useGMDispatch, useGMSelector} from "../../state/gameMasterState";

export default function GameMasterPage() {
    const { gameKey, gameTitle } = useGMSelector((state) => ({
        gameKey: state.game.gameKey,
        gameTitle: state.game.title,
    }));
    const dispatch = useGMDispatch();

    const onNewRuleClick = () => dispatch(actions.createRule({
        title: '（新規ルール）',
        text: '',
        accessList: [],
    }));

    return (
        <Grid container direction="column" spacing={4}>
            <Grid item><Typography variant="h3">ゲームマスター - {gameTitle}</Typography></Grid>
            <Grid component={Paper} item>
                <Typography variant="h5">ゲームキー：<b>{gameKey}</b></Typography>
            </Grid>
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