import React, {useContext} from 'react';
import {GameMasterStateContext} from "../../state/gameMasterState";
import RuleListComponent from '../../component/RuleList';
import RuleEditorComponent from '../../component/RuleEditor';
import {PlayerId} from "../../model";

export function RuleList() {
    const [state, dispatch] = useContext(GameMasterStateContext);

    return <RuleListComponent
        rules={state.rules}
        selectedRuleId={state.selectedRuleId}
        onRuleClick={(r) => dispatch({type: 'ChangeSelectedRule', ruleId: r.id})}/>;
}

export function RuleEditor() {
    const [state, dispatch] = useContext(GameMasterStateContext);

    const currentRuleId = state.selectedRuleId ?? -1;
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
        type: 'CreateRule',
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