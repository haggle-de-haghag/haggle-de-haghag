import { Box, List, ListItem, ListSubheader } from "@material-ui/core";
import React from "react";
import { Token } from "../model";

export interface Props {
    tokens: Token[];
    selectedTokenId?: number;
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
                        {token.title}
                    </ListItem>
                )}
            </List>
        </Box>
    )

}