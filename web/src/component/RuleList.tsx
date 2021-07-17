import React from 'react';
import {Box, List, ListItem, ListSubheader, makeStyles} from "@material-ui/core/index";
import {AccessType, Rule, RuleId} from "../model";

interface Props {
    rules: Rule[];
    selectedRuleId?: RuleId;
    onRuleClick: (r: Rule) => void;
}

const useStyles = makeStyles((theme) => ({
    subheader: {
        backgroundColor: theme.palette.background.paper,
    },
    assignedRule: {
        backgroundColor: '#e0e0ff',
    },
    sharedRule: {
        backgroundColor: '#ffffd0',
    }
}));


export default function RuleList(props: Props) {
    const classes = useStyles();
    const accessTypeClass: {[key in AccessType]: string} = {
        ASSIGNED: classes.assignedRule,
        SHARED: classes.sharedRule
    };

    return (
        <Box>
            <List subheader={<ListSubheader className={classes.subheader}>ルール</ListSubheader>}>
                {props.rules.map((rule) =>
                    <ListItem
                        key={rule.id}
                        button
                        selected={rule.id == props.selectedRuleId}
                        onClick={() => props.onRuleClick(rule)}
                        className={accessTypeClass[rule.accessType]}
                    >
                        {rule.ruleNumber}: {rule.title}
                    </ListItem>
                )}
            </List>
        </Box>
    )
}
