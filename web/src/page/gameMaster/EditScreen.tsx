import {Box, Button, Divider, Grid} from "@material-ui/core";
import {PlayerList, RuleEditor, RuleList, TokenEditor, TokenList} from "./materializedCompoents";
import React from "react";
import {actions, useGMDispatch} from "../../state/gameMasterState";

export default function EditScreen() {
    const dispatch = useGMDispatch();

    const onNewRuleClick = () => dispatch(actions.default.createRule({
        title: '（新規ルール）',
        text: '',
        accessList: [],
    }));

    const onNewTokenClick = () => dispatch(actions.default.createToken({
        title: '（新規トークン）',
        text: '',
    }));

    return <Grid container spacing={3}>
        <Grid item xs={3}>
            <Box><RuleList/></Box>
            <Box><Button variant="contained" onClick={onNewRuleClick}>新規ルール</Button></Box>
            <Box mt={2}><Divider/></Box>
            <Box><TokenList/></Box>
            <Box><Button variant="contained" onClick={onNewTokenClick}>新規トークン</Button></Box>
        </Grid>
        <Grid item xs={7}>
            <RuleEditor/>
            <TokenEditor/>
        </Grid>
        <Grid item xs={2}>
            <PlayerList/>
        </Grid>
    </Grid>;
}