import {useContext} from "react";
import {GameStateContext} from "../state/gameState";
import {UIStateContext} from "../state/uiState";
import RuleViewComponent from '../component/RuleView';

export default function RuleView() {
    const [gameState, gsDispatch] = useContext(GameStateContext);
    const [uiState, uiDispatch] = useContext(UIStateContext);

    const ruleNumber = uiState.selectedRuleNumber;
    const rule = ruleNumber == undefined
        ? undefined
        : gameState.rules.find((r) => r.ruleNumber == ruleNumber);

    return rule ? <RuleViewComponent rule={rule} /> : null;
}