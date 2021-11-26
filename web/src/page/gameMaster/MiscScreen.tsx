import {actions, useGMDispatch, useGMSelector} from "../../state/gameMasterState";
import {Button, Checkbox, FormControlLabel, Grid, TextField} from "@material-ui/core/index";
import {ChangeEvent, useState} from "react";

export function MiscScreen() {
    const [stubPlayerAmount, setStubPlayerAmount] = useState('1');
    const {game} = useGMSelector((state) => ({ game: state.game }));
    const dispatch = useGMDispatch();

    const onStubPlayersCreateButtonClick = () => {
        dispatch(actions.default.createStubPlayers(parseInt(stubPlayerAmount)));
    }

    const onPostMortemModeChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            if (confirm('感想戦モードを有効化します。\n全てのプレイヤーは全てのルールとトークンを見ることができるようになります。')) {
                dispatch(actions.default.setGameState('POST_MORTEM'));
            }
        } else {
            dispatch(actions.default.setGameState('PLAYING'));
        }
    }

    return <Grid container spacing={3}>
        <Grid item container spacing={3}>
            <Grid item>
                <TextField
                    label="仮プレイヤー作成"
                    type="number"
                    value={stubPlayerAmount}
                    onChange={(e) => setStubPlayerAmount(e.target.value)}
                />
            </Grid>
            <Grid item><Button variant="contained" color="primary" onClick={onStubPlayersCreateButtonClick}>追加</Button></Grid>
        </Grid>
        <Grid item>
            <FormControlLabel control={<Checkbox checked={game.state == 'POST_MORTEM'} onChange={onPostMortemModeChange}/>} label="感想戦モード"/>
        </Grid>
    </Grid>
}