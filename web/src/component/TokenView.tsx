import {makeStyles, Typography} from "@material-ui/core";
import { Grid } from "@material-ui/core";
import React, {useRef} from "react";
import { Token } from "../model";
import {IFrameView} from "./IFrameView";

export interface Props {
    token: Token;
}

const useStyle = makeStyles((theme) => ({
    iframe: {
        border: 'none',
    }
}));

export default function TokenView(props: Props) {
    const { token } = props;
    const styles = useStyle();
    const iframeRef = useRef(null as (HTMLIFrameElement | null));

    return <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2} alignItems="flex-end" justify="space-between">
            <Grid item><Typography variant="h3">{token.title}</Typography></Grid>
            <Grid item>所持数：{token.amount}</Grid>
        </Grid>
        <Grid item>
            <Typography><IFrameView html={token.text} /></Typography>
        </Grid>
    </Grid>
}