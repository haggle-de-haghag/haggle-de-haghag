import {Box, Button, Divider, Grid, makeStyles, Paper, Snackbar, Tab, Tabs, Typography} from "@material-ui/core/index";
import React, {useState} from "react";
import {GameSummaryPane, PlayerList, RuleEditor, RuleList, TokenEditor, TokenList} from "./materializedCompoents";
import {actions, useGMDispatch, useGMSelector} from "../../state/gameMasterState";
import {Alert} from "@material-ui/lab";
import {EditableLabel} from "../../component/EditableLabel";
import EditScreen from "./EditScreen";

const useStyles = makeStyles((theme) => ({
    titleEdit: {
        fontSize: theme.typography.h3.fontSize,
    },
    gameKeyBox: {
        display: 'inline-flex',
        alignSelf: 'stretch',
        alignItems: 'center',
        padding: theme.spacing(),
    }
}));

export default function GameMasterPage() {
    const { gameKey, gameTitle, notification, errorNotification } = useGMSelector((state) => ({
        gameKey: state.game.gameKey,
        gameTitle: state.game.title,
        notification: state.notification.message,
        errorNotification: state.errorNotification.message,
    }));
    const [tabIndex, setTabIndex] = useState(0);
    const dispatch = useGMDispatch();
    const classes = useStyles();

    const onTitleUpdate = (title: string) => dispatch(actions.default.updateTitle(title));

    return (
        <Grid container direction="column" spacing={4}>
            <Grid item container alignItems="center">
                <Grid item><Typography variant="h3"> ゲームマスター -&nbsp;</Typography></Grid>
                <Grid item><EditableLabel className={classes.titleEdit} labelText={gameTitle} onUpdate={onTitleUpdate} /></Grid>
                <Grid className={classes.gameKeyBox} component={Paper} item>
                    <Typography variant="h5">ゲームキー：<b>{gameKey}</b></Typography>
                </Grid>
            </Grid>
            <Grid item>
                <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)}>
                    <Tab label="ルール編集" />
                    <Tab label="ゲーム状況" />
                </Tabs>
            </Grid>
            <Grid item container spacing={3}>
                {tabIndex == 0 && <EditScreen />}
                {tabIndex == 1 && <GameSummaryPane />}
            </Grid>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={errorNotification !== undefined}>
                <Alert severity="error">{errorNotification}</Alert>
            </Snackbar>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={notification !== undefined}
                message={notification} />
        </Grid>
    )
}