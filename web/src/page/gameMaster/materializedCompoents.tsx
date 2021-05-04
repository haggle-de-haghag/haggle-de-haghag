import React from 'react';
import RuleListComponent from '../../component/RuleList';
import RuleEditorComponent from '../../component/RuleEditor';
import {PlayerId} from "../../model";
import {actions, useGMDispatch, useGMSelector} from "../../state/gameMasterState";

export function RuleList() {
    const { rules, selectedRuleId } = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    return <RuleListComponent
        rules={rules}
        selectedRuleId={selectedRuleId}
        onRuleClick={(r) => dispatch(actions.changeSelectedRule(r.id))}/>;
}

export function RuleEditor() {
    const state = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    const currentRuleId = state.selectedRuleId;
    if (currentRuleId == undefined) {
        return null;
    }

    const assignedPlayerIds = state.defaultAssignmentsInput;

    const onRuleTitleChange = (text: string) => dispatch(actions.setRuleTitleInput(text));
    const onRuleTextChange = (text: string) => dispatch(actions.setRuleTextInput(text));
    const onSaveButtonClick = () => dispatch(actions.updateRule({
        ruleId: currentRuleId,
        title: state.ruleTitleInput,
        text: state.ruleTextInput,
        defaultAssignments: assignedPlayerIds,
    }));
    const onAssignmentChange = (playerId: PlayerId, assigned: boolean) => dispatch(actions.changeRuleAccessListInput({
        playerId,
        ruleId: currentRuleId,
        assigned
    }));

    return <RuleEditorComponent
        ruleTitle={state.ruleTitleInput}
        ruleText={state.ruleTextInput}
        players={state.players}
        assignedPlayerIds={assignedPlayerIds}
        onRuleTitleChange={onRuleTitleChange}
        onRuleTextChange={onRuleTextChange}
        onSaveButtonClick={onSaveButtonClick}
        onAssignmentChange={onAssignmentChange}
    />;
}