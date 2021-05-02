import {Box, Button, Chip, Grid, makeStyles, TextField, Typography} from "@material-ui/core/index";
import {Player, PlayerId} from "../model";
import DoneIcon from '@material-ui/icons/Done';

interface Props {
    ruleTitle: string;
    ruleText: string;
    players: Player[];
    assignedPlayerIds: PlayerId[];
    onRuleTitleChange: (value: string) => void;
    onRuleTextChange: (value: string) => void;
    onAssignmentChange: (playerId: PlayerId, assigned: boolean) => void;
    onSaveButtonClick: () => void;
}

const useStyles = makeStyles((theme) => ({
    assignments: {
        '& > *': {
            margin: theme.spacing(0.5),
        }
    }
}));

export default function RuleEditor(props: Props) {
    const classes = useStyles();

    return <Grid container direction="column" spacing={2}>
        <Grid item>
            <TextField
                variant="filled"
                label="タイトル"
                fullWidth
                value={props.ruleTitle}
                onChange={(e) => props.onRuleTitleChange(e.target.value)}
            />
        </Grid>
        <Grid item>
            <TextField
                variant="filled"
                label="ルール文章"
                multiline
                rows={5}
                fullWidth
                value={props.ruleText}
                onChange={(e) => props.onRuleTextChange(e.target.value)}
            />
        </Grid>
        <Grid item>
            <Typography variant="subtitle1">初期割り当て</Typography>
            <Box className={classes.assignments}>
                {props.players.map((p) => {
                    const assigned = props.assignedPlayerIds.includes(p.id);
                    return <Chip
                        key={p.id}
                        variant={assigned ? 'default' : 'outlined'}
                        icon={assigned ? <DoneIcon /> : undefined}
                        label={p.displayName}
                        color={assigned ? 'primary' : 'default'}
                        onClick={() => props.onAssignmentChange(p.id, !assigned)}
                    />;
                })}
            </Box>
        </Grid>
        <Grid item xs={2}>
            <Button variant="contained" onClick={() => props.onSaveButtonClick()}>保存</Button>
        </Grid>
    </Grid>;
}