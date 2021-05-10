import {
    Box,
    Button,
    Chip,
    Grid,
    makeStyles,
    Table,
    TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from "@material-ui/core";
import React from "react";
import {ForeignPlayer} from "../model";

interface Props {
    tokenTitle: string;
    tokenText: string;
    players: ForeignPlayer[];
    allocation: {[key: number]: number}; // key: playerId
    onTokenTitleChange: (value: string) => void;
    onTokenTextChange: (value: string) => void;
    onSaveButtonClick: () => void;
}

export default function TokenEditor(props: Props) {
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
        <Grid item>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>プレイヤー名</TableCell>
                            <TableCell>所持数</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.players.map((p) =>
                            <TableRow key={p.id}>
                                <TableCell>{p.displayName}</TableCell>
                                <TableCell><TextField value={props.allocation[p.id] ?? 0} /></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
        <Grid item xs={2}>
            <Button variant="contained" onClick={() => props.onSaveButtonClick()}>保存</Button>
        </Grid>
    </Grid>;
}