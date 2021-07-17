import React from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Grid, Link,
    List,
    ListItem, makeStyles,
    TextField,
    Typography
} from "@material-ui/core/index";
import {actions, useLobbyDispatch, useLobbySelector} from "../../state/lobbyState";
import {knownGames} from "../../storage/knownGames";

const useStyles = makeStyles((theme) => ({
    historyList: {
        marginTop: theme.spacing(),
    },
}));

export function LobbyPage() {
    const { gameTitleInput, gameKeyInput, playerNameInput } = useLobbySelector((state) => state);
    const dispatch = useLobbyDispatch();
    const classes = useStyles();

    const onGameTitleInputChange = (value: string) => dispatch(actions.setGameTitleInput(value));
    const onGameKeyInputChange = (value: string) => dispatch(actions.setGameKeyInput(value));
    const onPlayerNameInputChange = (value: string) => dispatch(actions.setPlayerNameInput(value));
    const onCreateGame = () => dispatch(actions.createGame({ title: gameTitleInput }));
    const onJoinGame = () => dispatch(actions.joinGame({ gameKey: gameKeyInput, playerName: playerNameInput }));

    return <Box display="flex" justifyContent="space-between">
        <Box component={Card} width={0.45}>
            <Box display="flex" flexDirection="column" height="100%">
                <Box component={CardContent}>
                    <Typography variant="h3">ゲームマスター</Typography>
                </Box>
                <CardActions>
                    <Grid container direction="column" spacing={2}>
                        <Grid item><TextField label="ゲーム名" value={gameTitleInput} onChange={(e) => onGameTitleInputChange(e.target.value)} /></Grid>
                        <Grid item><Button variant="contained" color="primary" onClick={onCreateGame}>ゲームを作る</Button></Grid>
                    </Grid>
                </CardActions>
                <Box className={classes.historyList}>
                    <Typography variant="h4">履歴</Typography>
                    <List>
                        {knownGames.knownGameMasters.map((kg) =>
                            <ListItem key={kg.masterKey}><Link href={`game_master.html#${kg.masterKey}`}>{kg.title}</Link></ListItem>
                        ).reverse()}
                    </List>
                </Box>
            </Box>
        </Box>
        <Box component={Card} width={0.45}>
            <CardContent>
                <Typography variant="h3">プレイヤー</Typography>
            </CardContent>
            <CardActions>
                <Grid container direction="column" spacing={2}>
                    <Grid item container spacing={2}>
                        <Grid item><TextField label="ゲームキー" value={gameKeyInput} onChange={(e) => onGameKeyInputChange(e.target.value)}/></Grid>
                        <Grid item><TextField label="プレイヤー名" value={playerNameInput} onChange={(e) => onPlayerNameInputChange(e.target.value)}/></Grid>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={onJoinGame}>ゲームに参加する</Button>
                    </Grid>
                </Grid>
            </CardActions>
            <Box className={classes.historyList}>
                <Typography variant="h4">履歴</Typography>
                <List>
                    {knownGames.knownGames.map((kg) =>
                        <ListItem key={kg.gameKey}><Link href={`player.html#${kg.gameKey}`}>{kg.title}</Link></ListItem>
                    ).reverse()}
                </List>
            </Box>
        </Box>
    </Box>
}