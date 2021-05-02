import React from 'react';
import {Box, List, ListItem} from "@material-ui/core/index";
import {Rule, RuleId} from "../model";

interface Props {
    rules: Rule[];
    selectedRuleId?: RuleId;
    onRuleClick: (r: Rule) => void;
}

export default function RuleList(props: Props) {
    return (
        <Box>
            <List>
                {props.rules.map((rule) =>
                    <ListItem
                        key={rule.id}
                        button
                        selected={rule.id == props.selectedRuleId}
                        onClick={() => props.onRuleClick(rule)}
                    >
                        {rule.ruleNumber}: {rule.title}
                    </ListItem>
                )}
            </List>
        </Box>
    )
}
