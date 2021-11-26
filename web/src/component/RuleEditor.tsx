import {
    Box,
    Button,
    Chip,
    Dialog, DialogActions,
    DialogContent,
    Grid,
    makeStyles, Tab, Tabs,
    TextField,
    Typography
} from "@material-ui/core/index";
import {ForeignPlayer, PlayerId} from "../model";
import DoneIcon from '@material-ui/icons/Done';
import {useState} from "react";
import {IFrameView} from "./IFrameView";

interface Props {
    ruleTitle: string;
    ruleText: string;
    players: ForeignPlayer[];
    assignedPlayerIds: PlayerId[];
    dirty: boolean;
    onRuleTitleChange: (value: string) => void;
    onRuleTextChange: (value: string) => void;
    onAssignmentChange: (playerId: PlayerId, assigned: boolean) => void;
    onSaveButtonClick: () => void;
    onDeleteButtonClick: () => void;
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    const onDeleteDialogClose = (reallyDelete: boolean) => {
        setDeleteDialogOpen(false);
        if (reallyDelete) {
            props.onDeleteButtonClick();
        }
    };

    const onTabChange = (_: any, value: number) => {
        setTabIndex(value);
    };

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
            <Tabs value={tabIndex} onChange={onTabChange}>
                <Tab label="HTML" />
                <Tab label="プレビュー" />
            </Tabs>
            {tabIndex == 0 &&
                <TextField
                    variant="filled"
                    label="ルール文章（最大3000文字。HTMLが使えます）"
                    multiline
                    rows={5}
                    fullWidth
                    value={props.ruleText}
                    onChange={(e) => props.onRuleTextChange(e.target.value)}
                />}
            {tabIndex == 1 &&
                <IFrameView html={props.ruleText} />
            }
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
                        onBlur={() => props.onSaveButtonClick()}
                    />;
                })}
            </Box>
        </Grid>
        <Grid item container spacing={2}>
            <Grid item><Button variant="contained" onClick={() => props.onSaveButtonClick()}>保存</Button></Grid>
            <Grid item><Button variant="contained" color="secondary" onClick={() => setDeleteDialogOpen(true)}>削除</Button></Grid>
            <Dialog open={deleteDialogOpen} onClose={() => onDeleteDialogClose(false)}>
                <DialogContent>本当に削除しますか？</DialogContent>
                <DialogActions>
                    <Button onClick={() => onDeleteDialogClose(false)}>やめる</Button>
                    <Button onClick={() => onDeleteDialogClose(true)} color="secondary">削除する</Button>
                </DialogActions>
            </Dialog>
        </Grid>
        <Grid item>{props.dirty && <Typography variant="subtitle2">未保存の変更があります。</Typography>}</Grid>
    </Grid>;
}