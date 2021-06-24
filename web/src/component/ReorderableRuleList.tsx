import {Rule, RuleId} from "../model";
import {Box, List, ListItem, ListSubheader} from "@material-ui/core";
import React from "react";
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd';

interface Props {
    rules: Rule[];
    selectedRuleId?: RuleId;
    onRuleClick: (r: Rule) => void;
    onDragEnd: (ruleId: RuleId, to: number) => void;
}

export default function ReorderableRuleList(props: Props) {
    const onDragEnd = (result: DropResult) => {
        const dest = result.destination?.index;
        if (dest != undefined) {
            const rule = props.rules[result.source.index];
            props.onDragEnd(rule.id, dest);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="rule-list">
                {(provided, snapshot) =>
                    <List ref={provided.innerRef} subheader={<ListSubheader>ルール</ListSubheader>} {...provided.droppableProps}>
                        {props.rules.map((rule, index) =>
                            <DraggableItem
                                key={rule.id}
                                rule={rule}
                                index={index}
                                selected={rule.id == props.selectedRuleId}
                                onClick={props.onRuleClick}
                            />
                        )}
                        {provided.placeholder}
                    </List>
                }
            </Droppable>
        </DragDropContext>
    );
}

function DraggableItem(props: { rule: Rule, index: number, selected: boolean, onClick: (r: Rule) => void }) {
    return <Draggable draggableId={`rule-${props.rule.id}`} index={props.index}>
        {(provided, snapshot) =>
            <ListItem
                button
                selected={props.selected}
                onClick={() => props.onClick(props.rule)}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
            >
                {props.rule.ruleNumber}: {props.rule.title}
            </ListItem>
        }
    </Draggable>;
}