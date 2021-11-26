import {Box, Button, Divider, Grid} from "@material-ui/core";
import {PlayerList, RuleEditor, RuleList, TokenEditor, TokenList} from "./materializedCompoents";
import React from "react";
import {actions, useGMDispatch, useGMSelector} from "../../state/gameMasterState";
import {makeStyles} from "@material-ui/core/index";

const useStyles = makeStyles((theme) => ({
    menu: {
        overflowY: 'scroll',
        height: 'calc(100vh - 300px)',
        paddingTop: '0 !important',
    },
}));

export default function EditScreen() {
    const classes = useStyles();
    const { selectedRuleId, selectedTokenId } = useGMSelector((state) => state);
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
        <Grid item xs={3} className={classes.menu}>
            <Box><RuleList/></Box>
            <Box><Button variant="contained" onClick={onNewRuleClick}>新規ルール</Button></Box>
            <Box mt={2}><Divider/></Box>
            <Box><TokenList/></Box>
            <Box><Button variant="contained" onClick={onNewTokenClick}>新規トークン</Button></Box>
        </Grid>
        <Grid item xs={9}>
            {selectedRuleId != undefined && <RuleEditor key={selectedRuleId}/>}
            {selectedTokenId != undefined && <TokenEditor key={selectedTokenId}/>}
        </Grid>
    </Grid>;
}