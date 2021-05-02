import {GameId, Player, PlayerId, Rule, RuleId} from "../model";
import React, {Dispatch} from "react";

export interface GameMasterState {
    // Model state
    players: Player[];
    rules: Rule[];
    ruleAccessList: { [key: number]: RuleId[] }; // key: PlayerId

    // UI state
    ruleTitleInput: string;
    ruleTextInput: string;
    selectedRuleId?: RuleId;
}

export interface CreateRule {
    type: 'CreateRule';
    title: string;
    text: string;
}

export interface UpdateRule {
    type: 'UpdateRule';
    ruleId: RuleId;
    title?: string;
    text?: string;
}

export interface ChangeRuleAccess {
    type: 'ChangeRuleAccess';
    playerId: PlayerId;
    ruleId: RuleId;
    assigned: boolean;
}

export interface SetRuleTitleInput {
    type: 'SetRuleTitleInput';
    value: string;
}

export interface SetRuleTextInput {
    type: 'SetRuleTextInput';
    value: string;
}

export interface ChangeSelectedRule {
    type: 'ChangeSelectedRule';
    ruleId: RuleId;
}

export type GameMasterAction = CreateRule | UpdateRule | ChangeRuleAccess | SetRuleTitleInput | SetRuleTextInput | ChangeSelectedRule;

const fallback: GameMasterState = {
    players: [],
    rules: [],
    ruleAccessList: [],
    ruleTitleInput: '',
    ruleTextInput: '',
};

export const GameMasterStateContext: React.Context<[GameMasterState, Dispatch<GameMasterAction>]>
    = React.createContext([fallback, (_: GameMasterAction) => {}]);
