import React, {useEffect, useRef} from 'react';
import {Rule} from "../model";
import {Avatar, Box, Grid, makeStyles, Typography} from "@material-ui/core/index";
import {IFrameView} from "./IFrameView";

interface Props {
    rule: Rule;
}

export default function RuleView(props: Props) {
    const { rule } = props;

    return <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2} alignItems="center">
            <Grid item><Avatar>{rule.ruleNumber}</Avatar></Grid>
            <Grid item><Typography variant="h3">{rule.title}</Typography></Grid>
        </Grid>
        <Grid item>
            <Typography><IFrameView html={rule.text} /></Typography>
        </Grid>
    </Grid>
}