import { Box, Button, Chip, Grid, makeStyles, TextField, Typography } from "@material-ui/core";
import React from "react";

interface Props {
    tokenTitle: string;
    tokenText: string;
    onTokenTitleChange: (value: string) => void;
    onTokenTextChange: (value: string) => void;
    onSaveButtonClick: () => void;
}

const useStyles = makeStyles((theme) => ({
    assignments: {
        '& > *': {
            margin: theme.spacing(0.5),
        }
    }
}));

export default function TokenEditor(props: Props) {
    const classes = useStyles();

    return <Grid container direction="column" spacing={2}>
        <Grid item>
            <TextField
                variant="filled"
                label="名称"
                fullWidth
                value={props.tokenTitle}
                onChange={(e) => props.onTokenTitleChange(e.target.value)}
            />
        </Grid>
        <Grid item>
            <TextField
                variant="filled"
                label="説明"
                multiline
                rows={5}
                fullWidth
                value={props.tokenText}
                onChange={(e) => props.onTokenTextChange(e.target.value)}
            />
        </Grid>
        <Grid item xs={2}>
            <Button variant="contained" onClick={() => props.onSaveButtonClick()}>保存</Button>
        </Grid>
    </Grid>;
}