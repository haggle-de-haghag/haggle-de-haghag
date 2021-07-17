import {actions, useGMDispatch} from "../../state/gameMasterState";
import {Button, Grid, TextField} from "@material-ui/core/index";
import {useState} from "react";

export function MiscScreen() {
    const [stubPlayerAmount, setStubPlayerAmount] = useState('1');
    const dispatch = useGMDispatch();

    const onStubPlayersCreateButtonClick = () => {
        dispatch(actions.default.createStubPlayers(parseInt(stubPlayerAmount)));
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
    </Grid>
}