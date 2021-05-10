import React from "react";
import RuleListComponent from "../../component/RuleList";
import {actions, usePLDispatch, usePLSelector} from "../../state/playerState";
import RuleViewComponent from "../../component/RuleView";
import TokenListComponent from "../../component/TokenList";
import TokenViewComponent from "../../component/TokenView";
import {AccessType, ForeignPlayer, Token} from "../../model";
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
    if (rule == undefined || rule.accessType != 'ASSIGNED') {
        return null;
    }

    const handleShareButton = (p: ForeignPlayer) => dispatch(actions.shareRule({ rule, player: p }));

    return <ShareRulePaneComponent players={players} onShareButtonClick={handleShareButton} />;
}

export function TokenList() {
    const { tokens, selectedTokenId } = usePLSelector((state) => ({
        tokens: state.tokens,
        selectedTokenId: state.selectedTokenId,
    }));
    const dispatch = usePLDispatch();

    const onTokenClick = (t: Token) => dispatch(actions.setSelectedTokenId(t.id));
    return <TokenListComponent tokens={tokens} selectedTokenId={selectedTokenId} onTokenClick={onTokenClick}/>;
}

export function TokenView() {
    const { tokens, selectedTokenId } = usePLSelector((state) => ({
        tokens: state.tokens,
        selectedTokenId: state.selectedTokenId,
    }));

    const token = tokens.find((t) => t.id == selectedTokenId);
    if (token === undefined) {
        return null;
    }

    return <TokenViewComponent token={token} />;
}