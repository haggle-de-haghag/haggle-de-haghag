import React from 'react';
import RuleListComponent from '../../component/RuleList';
import RuleEditorComponent from '../../component/RuleEditor';
import {PlayerId} from "../../model";
import {useGMDispatch, useGMSelector} from "../../state/gameMasterState";

export function RuleList() {
    const { rules, selectedRuleId } = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    return <RuleListComponent
        rules={rules}
        selectedRuleId={selectedRuleId}
        onRuleClick={(r) => dispatch({type: 'ChangeSelectedRule', ruleId: r.id})}/>;
}

export function RuleEditor() {
    const state = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    const currentRuleId = state.selectedRuleId;
    if (currentRuleId == undefined) {
        return null;
    }

    const assignedPlayerIds = state.ruleAccessListInput;

    const onRuleTitleChange = (text: string) => dispatch({
        type: 'SetRuleTitleInput',
        value: text
    });
    const onRuleTextChange = (text: string) => dispatch({
        type: 'SetRuleTextInput',
        value: text,
    });
    const onSaveButtonClick = () => dispatch({
        type: 'UpdateRule',
        ruleId: currentRuleId,
        title: state.ruleTitleInput,
        text: state.ruleTextInput,
        accessList: assignedPlayerIds,
    });
    const onAssignmentChange = (playerId: PlayerId, assigned: boolean) => dispatch({
        type: 'ChangeRuleAccessListInput',
        playerId,
        ruleId: currentRuleId,
        assigned
    });

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