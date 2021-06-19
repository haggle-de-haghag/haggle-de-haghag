import React from 'react';
import RuleListComponent from '../../component/RuleList';
import RuleEditorComponent from '../../component/RuleEditor';
import TokenListComponent from '../../component/TokenList';
import TokenEditorComponent from '../../component/TokenEditor';
import PlayerListComponent from '../../component/PlayerList';
import GameSummaryPaneComponent from '../../component/GameSummaryPane';
import {Player, PlayerId, Token} from "../../model";
import {actions, useGMDispatch, useGMSelector} from "../../state/gameMasterState";

export function RuleList() {
    const { rules, selectedRuleId } = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    return <RuleListComponent
        rules={rules}
        selectedRuleId={selectedRuleId}
        onRuleClick={(r) => dispatch(actions.default.changeSelectedRule(r.id))}/>;
}

export function RuleEditor() {
    const state = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    const currentRuleId = state.selectedRuleId;
    if (currentRuleId == undefined) {
        return null;
    }

    const assignedPlayerIds = state.defaultAssignmentsInput;

    const onRuleTitleChange = (text: string) => dispatch(actions.default.setRuleTitleInput(text));
    const onRuleTextChange = (text: string) => dispatch(actions.default.setRuleTextInput(text));
    const onSaveButtonClick = () => dispatch(actions.default.updateRule({
        ruleId: currentRuleId,
        title: state.ruleTitleInput,
        text: state.ruleTextInput,
        defaultAssignments: assignedPlayerIds,
    }));
    const onDeleteButtonClick = () => dispatch(actions.default.deleteRule(currentRuleId));
    const onAssignmentChange = (playerId: PlayerId, assigned: boolean) => dispatch(actions.default.changeRuleAccessListInput({
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
        onDeleteButtonClick={onDeleteButtonClick}
        onAssignmentChange={onAssignmentChange}
    />;
}

export function TokenList() {
    const { tokens, selectedTokenId } = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    return <TokenListComponent
        tokens={tokens}
        selectedTokenId={selectedTokenId}
        onTokenClick={(t) => dispatch(actions.default.changeSelectedToken(t.id))}/>;
}

export function TokenEditor() {
    const state = useGMSelector((state) => state);
    const dispatch = useGMDispatch();

    const currentTokenId = state.selectedTokenId;
    if (currentTokenId == undefined) {
        return null;
    }

    const onTokenTitleChange = (text: string) => dispatch(actions.default.setTokenTitleInput(text));
    const onTokenTextChange = (text: string) => dispatch(actions.default.setTokenTextInput(text));
    const onAllocationChange = (playerId: number, amount: number) => dispatch(actions.default.setAllocation({ playerId, amount }));
    const onSaveButtonClick = () => dispatch(actions.default.updateToken({
        tokenId: currentTokenId,
        title: state.tokenTitleInput,
        text: state.tokenTextInput,
        allocation: state.allocationInputs,
    }));
    const onDeleteButtonClick = () => dispatch(actions.default.deleteToken(currentTokenId));

    return <TokenEditorComponent
        tokenTitle={state.tokenTitleInput}
        tokenText={state.tokenTextInput}
        players={state.players}
        allocation={state.allocationInputs}
        onTokenTitleChange={onTokenTitleChange}
        onTokenTextChange={onTokenTextChange}
        onAllocationChange={onAllocationChange}
        onSaveButtonClick={onSaveButtonClick}
        onDeleteButtonClick={onDeleteButtonClick}
    />;
}

export function PlayerList() {
    const { players } = useGMSelector((state) => ({
        players: state.players
    }));
    return <PlayerListComponent players={players} />;
}

export function GameSummaryPane() {
    const { players, rules, ruleAccessList, tokens, tokenAllocationMap } = useGMSelector((state) => ({
        players: state.players,
        rules: state.rules,
        ruleAccessList: state.ruleAccessList,
        tokens: state.tokens,
        tokenAllocationMap: state.tokenAllocationMap
    }));
    const dispatch = useGMDispatch();

    const onAddTokenToPlayer = (player: Player, token: Token, amount: number) => {
        dispatch(actions.default.addTokenToPlayer({ playerId: player.id, tokenId: token.id, amount }));
    }

    return <GameSummaryPaneComponent
        players={players}
        rules={rules}
        ruleAccessList={ruleAccessList}
        tokens={tokens}
        tokenAllocationMap={tokenAllocationMap}
        onAddTokenToPlayer={onAddTokenToPlayer}
    />;
}