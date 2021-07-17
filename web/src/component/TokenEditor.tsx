import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Grid, Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, Tabs,
    TextField
} from "@material-ui/core";
import React, {useState} from "react";
import {ForeignPlayer} from "../model";
import {IFrameView} from "./IFrameView";

interface Props {
    tokenTitle: string;
    tokenText: string;
    players: ForeignPlayer[];
    allocation: {[key: number]: number}; // key: playerId
    onTokenTitleChange: (value: string) => void;
    onTokenTextChange: (value: string) => void;
    onAllocationChange: (playerId: number, amount: number) => void;
    onSaveButtonClick: () => void;
    onDeleteButtonClick: () => void;
}

export default function TokenEditor(props: Props) {
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
                label="名称"
                fullWidth
                value={props.tokenTitle}
                onChange={(e) => props.onTokenTitleChange(e.target.value)}
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
                label="説明（最大3000文字。HTMLが使えます）"
                multiline
                rows={5}
                fullWidth
                value={props.tokenText}
                onChange={(e) => props.onTokenTextChange(e.target.value)}
            />}
            {tabIndex == 1 &&
                <IFrameView html={props.tokenText} />
            }
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
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={props.allocation[p.id] ?? 0}
                                        onChange={(e) => props.onAllocationChange(p.id, parseInt(e.target.value))}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
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
    </Grid>;
}