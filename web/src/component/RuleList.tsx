import React from 'react';
import {Box, List, ListItem, ListSubheader, makeStyles} from "@material-ui/core/index";
import {Rule, RuleId} from "../model";

interface Props {
    rules: Rule[];
    selectedRuleId?: RuleId;
    onRuleClick: (r: Rule) => void;
}

const useStyles = makeStyles((theme) => ({
    subheader: {
        backgroundColor: theme.palette.background.paper,
    }
}));


export default function RuleList(props: Props) {
    const classes = useStyles();

    return (
        <Box>
            <List subheader={<ListSubheader className={classes.subheader}>ルール</ListSubheader>}>
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
