import { Typography } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import React from "react";
import { Token } from "../model";

export interface Props {
    token: Token;
}

export default function TokenView(props: Props) {
    const { token } = props;
    return <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2} alignItems="flex-end" justify="space-between">
            <Grid item><Typography variant="h3">{token.title}</Typography></Grid>
            <Grid item>所持数：{token.amount}</Grid>
        </Grid>
        <Grid item>
            <Typography>{token.text}</Typography>
        </Grid>
    </Grid>
}