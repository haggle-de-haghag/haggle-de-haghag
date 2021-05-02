import React, {useContext} from 'react';
import {GameStateContext} from "../state/gameState";
import RuleListComponent from '../component/RuleList';
import {UIStateContext} from "../state/uiState";

export default function RuleList() {
    const [gameState, gsDispatch] = useContext(GameStateContext);
    const [uiState, uiDispatch] = useContext(UIStateContext);

    return <RuleListComponent
        rules={gameState.rules}
        onRuleClick={(rule) => uiDispatch({type: 'SetSelectedRule', rule: rule})}
    />;
}