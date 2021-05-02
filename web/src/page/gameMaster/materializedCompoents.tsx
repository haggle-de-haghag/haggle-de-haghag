import React, {useContext} from 'react';
import {GameMasterStateContext} from "../../state/gameMasterState";
import RuleListComponent from '../../component/RuleList';
import RuleEditorComponent from '../../component/RuleEditor';

export function RuleList() {
    const [state, dispatch] = useContext(GameMasterStateContext);

    return <RuleListComponent
        rules={state.rules}
        onRuleClick={(r) => dispatch({type: 'ChangeSelectedRule', ruleId: r.id})}/>;
}

export function RuleEditor() {
    const [state, dispatch] = useContext(GameMasterStateContext);

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
    })

    return <RuleEditorComponent
        ruleTitle={state.ruleTitleInput}
        ruleText={state.ruleTextInput}
        onRuleTitleChange={onRuleTitleChange}
        onRuleTextChange={onRuleTextChange}
        onSaveButtonClick={onSaveButtonClick}
    />;
}