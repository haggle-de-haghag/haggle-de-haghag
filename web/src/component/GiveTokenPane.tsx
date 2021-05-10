import {ForeignPlayer, PlayerId, Token} from "../model";
import {Box, Button, Input, MenuItem, Select, TextField} from "@material-ui/core/index";
import {makeStyles} from "@material-ui/core";

export interface Props {
    token: Token;
    players: ForeignPlayer[];
    selectedPlayerId: PlayerId;
    amountInput: number;
    onAmountChange: (amount: number) => void;
    onPlayerSelect: (playerId: PlayerId) => void;
    onGiveButtonClick: () => void;
}

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            'marginRight': theme.spacing(1),
        },
    },
    amountInput: {
        width: '64px',
    }
}));

export default function GiveTokenPane(props: Props) {
    const classes = useStyles();

    // No other players - it is a normal state, but cannot display the pane
    if (props.players.length == 0) {
        return null;
    }

    const selectedPlayer = props.players.find((p) => p.id == props.selectedPlayerId);
    if (selectedPlayer == undefined) {
        throw new Error(`Invalid selected playerId: ${props.selectedPlayerId}`);
    }

    return <Box className={classes.root} display="flex" alignItems="center">
        <Select value={props.selectedPlayerId} onChange={(e) => props.onPlayerSelect(e.target.value as PlayerId)}>
            {props.players.map((p) => <MenuItem key={p.id} value={p.id}>{p.displayName}</MenuItem>)}
        </Select>
        <Box>に</Box>
        <TextField className={classes.amountInput} type="number" value={props.amountInput} onChange={(e) => props.onAmountChange(parseInt(e.target.value))} />
        <Box>個</Box>
        <Button variant="contained" color="primary" onClick={() => props.onGiveButtonClick()}>あげる</Button>
    </Box>;
}