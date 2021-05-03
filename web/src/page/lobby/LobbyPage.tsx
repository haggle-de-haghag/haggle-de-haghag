import React from "react";
import {Box, Button, Card, CardActions, CardContent, Grid, TextField, Typography} from "@material-ui/core/index";
import {actions, useLobbyDispatch, useLobbySelector} from "../../state/lobbyState";

export function LobbyPage() {
    const { gameKeyInput, playerNameInput } = useLobbySelector((state) => state);
    const dispatch = useLobbyDispatch();

    const onGameKeyInputChange = (value: string) => dispatch(actions.setGameKeyInput(value));
    const onPlayerNameInputChange = (value: string) => dispatch(actions.setPlayerNameInput(value));
    const onCreateGame = () => dispatch(actions.createGame());
    const onJoinGame = () => dispatch(actions.joinGame({ gameKey: gameKeyInput, playerName: playerNameInput }));

    return <Box display="flex" justifyContent="space-between">
        <Box component={Card} width={0.45}>
            <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
                <Box component={CardContent}>
                    <Typography variant="h3">ゲームマスター</Typography>
                </Box>
                <Box component={CardActions}>
                    <Button variant="contained" color="primary" onClick={onCreateGame}>ゲームを作る</Button>
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
        </Box>
    </Box>
}