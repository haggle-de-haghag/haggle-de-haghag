import React, {useEffect, useRef} from 'react';
import {Rule} from "../model";
import {Avatar, Box, Grid, makeStyles, Typography} from "@material-ui/core/index";

interface Props {
    rule: Rule;
}

const useStyle = makeStyles((theme) => ({
    iframe: {
        border: 'none',
    }
}));

export default function RuleView(props: Props) {
    const { rule } = props;
    const styles = useStyle();
    const iframeRef = useRef(null as (HTMLIFrameElement | null));

    useEffect(() => {
        const ref = iframeRef.current;
        if (ref != null) {
            const doc = ref.contentDocument;
            if (doc != null) {
                doc.open();
                doc.write(rule.text.replaceAll("\n", "<br>"));
                doc.close();
                ref.style.height = `${ref.contentDocument?.scrollingElement?.scrollHeight ?? 0}px`;
            }
        }
    }, [rule.text, iframeRef.current]);

    return <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2} alignItems="center">
            <Grid item><Avatar>{rule.ruleNumber}</Avatar></Grid>
            <Grid item><Typography variant="h3">{rule.title}</Typography></Grid>
        </Grid>
        <Grid item>
            <Typography><iframe ref={iframeRef} className={styles.iframe}/></Typography>
        </Grid>
    </Grid>
}