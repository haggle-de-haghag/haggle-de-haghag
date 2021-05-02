import React from 'react';
import {Box, List, ListItem} from "@material-ui/core/index";
import {Rule} from "../model";

interface Props {
    rules: Rule[];
    onRuleClick: (r: Rule) => void;
}

export default function RuleList(props: Props) {
    return (
        <Box>
            <List>
                {props.rules.map((rule) =>
                    <ListItem button onClick={() => props.onRuleClick(rule)}>{rule.title}</ListItem>
                )}
            </List>
        </Box>
    )
}
