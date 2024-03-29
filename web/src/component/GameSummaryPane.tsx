import {Player, Rule, RuleAccessMap, Token, TokenAllocationMap} from "../model";
import {ListItem, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {Avatar, Box, Button, Grid, IconButton, List, makeStyles} from "@material-ui/core/index";
import {AddCircle, RemoveCircle} from "@material-ui/icons";

interface Props {
    players: Player[];
    rules: Rule[];
    ruleAccessList: RuleAccessMap;
    tokens: Token[];
    tokenAllocationMap: TokenAllocationMap;
    onAddTokenToPlayer: (player: Player, token: Token, amount: number) => void;
    onKick: (player: Player) => void;
}

const useStyles = makeStyles((theme) => ({
    ruleListBox: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    assignedRule: {
        backgroundColor: theme.palette.primary.main,
    },
    sharedRule: {
        backgroundColor: theme.palette.secondary.main,
    },
    unknownRule: {
    },
    allocationListBox: {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
    },
    allocationButtonList: {
        display: 'flex',
        justifyContent: 'flex-end',
        flexWrap: 'nowrap',
    },
    legendAvatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        display: 'inline-flex',
    },
}));

export default function GameSummaryPane(props: Props) {
    const styles = useStyles();

    const renderPlayerRow = (player: Player) => {
        return <TableRow key={player.id}>
            <TableCell>
                {player.displayName}<br />
                <Button variant="contained" size="small" color="secondary" onClick={() => props.onKick(player)}>Kick</Button>
            </TableCell>
            <TableCell>
                <Box className={styles.ruleListBox}>
                    {props.rules.map((r) => {
                        const accessList = props.ruleAccessList[r.id];
                        const access = accessList?.find((a) => a.playerId == player.id);
                        const className = access == null
                            ? styles.unknownRule
                            : access.accessType == 'ASSIGNED'
                                ? styles.assignedRule
                                : styles.sharedRule;

                        return <Avatar className={className} key={r.id}>{r.ruleNumber}</Avatar>;
                    })}
                </Box>
            </TableCell>
            <TableCell>
                <List>
                    {props.tokens.map((t) => {
                        const allocationList = props.tokenAllocationMap[t.id];
                        const allocation = allocationList?.find((a) => a.playerId == player.id);
                        return <ListItem key={t.id}>
                            <Grid container className={styles.allocationListBox} spacing={4}>
                                <Grid item>{t.title}: {allocation?.amount ?? 0}</Grid>
                                <Grid item container className={styles.allocationButtonList}>
                                    <Grid item>
                                        <IconButton size="small" onClick={() => props.onAddTokenToPlayer(player, t, 1)}>
                                            <AddCircle />
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <IconButton size="small" onClick={() => props.onAddTokenToPlayer(player, t, -1)}>
                                            <RemoveCircle />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </ListItem>;
                    })}
                </List>
            </TableCell>
            <TableCell>{player.playerKey}</TableCell>
        </TableRow>
    };

    return <Table>
        <TableHead>
            <TableRow>
                <TableCell>プレイヤー</TableCell>
                <TableCell>
                    <p>ルール所持状況</p>
                    <Grid container spacing={2}>
                        <Grid item><Avatar className={`${styles.assignedRule} ${styles.legendAvatar}`} >1</Avatar>: 初期割当</Grid>
                        <Grid item><Avatar className={`${styles.sharedRule} ${styles.legendAvatar}`}>1</Avatar>: 見た</Grid>
                        <Grid item><Avatar className={`${styles.unknownRule} ${styles.legendAvatar}`}>1</Avatar>: 未知</Grid>
                    </Grid>
                </TableCell>
                <TableCell>トークン所持状況</TableCell>
                <TableCell>プレイヤーキー</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {props.players.map((p) => renderPlayerRow(p))}
        </TableBody>
    </Table>
}