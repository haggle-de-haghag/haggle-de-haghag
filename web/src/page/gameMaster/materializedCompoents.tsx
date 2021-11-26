import React, {useEffect, useRef, useState} from 'react';
import RuleListComponent from '../../component/ReorderableRuleList';
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
        onRuleClick={(r) => dispatch(actions.default.changeSelectedRule(r.id))}
        onDragEnd={(ruleId, to) => dispatch(actions.default.moveRule({ ruleId, to }))}
    />;
}

export function RuleEditor() {
    const state = useGMSelector((state) => state);
    const dispatch = useGMDispatch();
    const dirty = useRef(false);
    const saver = useRef(() => {});

    const currentRuleId = state.selectedRuleId;
    saver.current = () => {
        if (currentRuleId != null) {
            dispatch(actions.default.updateRule({
                ruleId: currentRuleId,
                title: state.ruleTitleInput,
                text: state.ruleTextInput,
                defaultAssignments: assignedPlayerIds,
            }));
            dispatch(actions.default.setLastSaveTime(new Date()));
        }
    };

    useEffect(() => {
        const timerId = setInterval(() => {
            if (dirty.current) {
                dirty.current = false;
                saver.current();
            }
        }, 5000);
        return () => {
            clearInterval(timerId);
            if (dirty.current) {
                saver.current();
            }
        }
    }, []);

    if (currentRuleId == undefined) {
        return null;
    }

    const assignedPlayerIds = state.defaultAssignmentsInput;

    const onRuleTitleChange = (text: string) => {
        dispatch(actions.default.setRuleTitleInput(text));
        dirty.current = true;
    };
    const onRuleTextChange = (text: string) => {
        dispatch(actions.default.setRuleTextInput(text));
        dirty.current = true;
    };

    const onDeleteButtonClick = () => dispatch(actions.default.deleteRule(currentRuleId));
    const onAssignmentChange = (playerId: PlayerId, assigned: boolean) => {
        dispatch(actions.default.changeRuleAccessListInput({
            playerId,
            ruleId: currentRuleId,
            assigned
        }));
        dirty.current = true;
    }

    return <RuleEditorComponent
        ruleTitle={state.ruleTitleInput}
        ruleText={state.ruleTextInput}
        players={state.players}
        assignedPlayerIds={assignedPlayerIds}
        dirty={dirty.current}
        onRuleTitleChange={onRuleTitleChange}
        onRuleTextChange={onRuleTextChange}
        onSaveButtonClick={saver.current}
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
    const dirty = useRef(false);
    const saver = useRef(() => {});

    const currentTokenId = state.selectedTokenId;
    saver.current = () => {
        if (currentTokenId != undefined) {
            dispatch(actions.default.updateToken({
                tokenId: currentTokenId,
                title: state.tokenTitleInput,
                text: state.tokenTextInput,
                allocation: state.allocationInputs,
            }));
        }
    }

    useEffect(() => {
        const timerId = setInterval(() => {
            if (dirty.current) {
                dirty.current = false;
                saver.current();
            }
        }, 5000);
        return () => {
            clearInterval(timerId);
            if (dirty.current) {
                saver.current();
            }
        }
    }, []);

    if (currentTokenId == undefined) {
        return null;
    }

    const onTokenTitleChange = (text: string) => {
        dispatch(actions.default.setTokenTitleInput(text));
        dirty.current = true;
    }
    const onTokenTextChange = (text: string) => {
        dispatch(actions.default.setTokenTextInput(text));
        dirty.current = true;
    }
    const onAllocationChange = (playerId: number, amount: number) => {
        dispatch(actions.default.setAllocation({ playerId, amount }));
        dirty.current = true;
    }

    const onDeleteButtonClick = () => dispatch(actions.default.deleteToken(currentTokenId));

    return <TokenEditorComponent
        tokenTitle={state.tokenTitleInput}
        tokenText={state.tokenTextInput}
        players={state.players}
        allocation={state.allocationInputs}
        dirty={dirty.current}
        onTokenTitleChange={onTokenTitleChange}
        onTokenTextChange={onTokenTextChange}
        onAllocationChange={onAllocationChange}
        onSaveButtonClick={saver.current}
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

    const onKick = (player: Player) => {
        if (window.confirm(`本当に${player.displayName}をKickしますか？`)) {
            dispatch(actions.default.kickPlayer(player));
        }
    }

    return <GameSummaryPaneComponent
        players={players}
        rules={rules}
        ruleAccessList={ruleAccessList}
        tokens={tokens}
        tokenAllocationMap={tokenAllocationMap}
        onAddTokenToPlayer={onAddTokenToPlayer}
        onKick={onKick}
    />;
}