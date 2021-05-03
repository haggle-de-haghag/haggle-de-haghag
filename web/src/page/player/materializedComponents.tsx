import React from "react";
import RuleListComponent from "../../component/RuleList";
import {actions, usePLDispatch, usePLSelector} from "../../state/playerState";
import RuleViewComponent from "../../component/RuleView";
import {ForeignPlayer} from "../../model";
import ShareRulePaneComponent from "../../component/ShareRulePane";

export function RuleList() {
    const { rules } = usePLSelector((state) => ({
        rules: state.rules,
    }));
    const dispatch = usePLDispatch();

    return <RuleListComponent
        rules={rules}
        onRuleClick={(rule) => dispatch(actions.setSelectedRuleId(rule.id))}
    />;
}

export function RuleView() {
    const { selectedRuleId, rules } = usePLSelector((state) => ({
        selectedRuleId: state.selectedRuleId,
        rules: state.rules
    }));

    const rule = selectedRuleId == undefined
        ? undefined
        : rules.find((r) => r.id == selectedRuleId);

    return rule ? <RuleViewComponent rule={rule} /> : null;
}

export function ShareRulePane() {
    const { selectedRuleId, rules, players } = usePLSelector((state) => ({
        selectedRuleId: state.selectedRuleId,
        rules: state.rules,
        players: state.players,
    }))
    const dispatch = usePLDispatch();

    const rule = selectedRuleId == undefined
        ? undefined
        : rules.find((r) => r.id == selectedRuleId);
    if (rule == undefined) {
        return null;
    }

    const handleShareButton = (p: ForeignPlayer) => dispatch(actions.shareRule({ rule, player: p }));

    return <ShareRulePaneComponent players={players} onShareButtonClick={handleShareButton} />;
}