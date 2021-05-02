import {useContext} from "react";
import {GameStateContext} from "../state/gameState";
import {UIStateContext} from "../state/uiState";
import ShareRulePaneComponent from '../component/ShareRulePane';
import {ForeignPlayer} from "../model";

export default function ShareRulePane() {
    const [gameState, gsDispatch] = useContext(GameStateContext);
    const [uiState, uiDispatch] = useContext(UIStateContext);

    const ruleNumber = uiState.selectedRuleNumber;
    const rule = ruleNumber == undefined
        ? undefined
        : gameState.rules.find((r) => r.ruleNumber == ruleNumber);
    if (rule == undefined) {
        return null;
    }

    const handleShareButton = (p: ForeignPlayer) => gsDispatch({
        type: 'ShareRule',
        rule: rule,
        player: p,
    });

    return <ShareRulePaneComponent players={gameState.players} onShareButtonClick={handleShareButton} />;
}