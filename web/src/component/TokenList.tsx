import {Box, List, ListItem, ListItemAvatar, ListSubheader} from "@material-ui/core";
import React from "react";
import { Token } from "../model";
import {Avatar} from "@material-ui/core/index";

export interface Props {
    tokens: Token[];
    selectedTokenId?: number;
    showAmount?: boolean;
    onTokenClick: (t: Token) => void;
}

export default function TokenList(props: Props) {
    const { tokens } = props;
    return (
        <Box>
            <List subheader={<ListSubheader>トークン</ListSubheader>}>
                {tokens.map((token) =>
                    <ListItem
                        key={token.id}
                        button
                        selected={token.id == props.selectedTokenId}
                        onClick={() => props.onTokenClick(token)}
                    >
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                            {token.title}
                            {props.showAmount && <ListItemAvatar><Avatar>{ token.amount }</Avatar></ListItemAvatar>}
                        </Box>
                    </ListItem>
                )}
            </List>
        </Box>
    )

}