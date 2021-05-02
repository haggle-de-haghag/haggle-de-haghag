import React, {Dispatch, useReducer} from "react";
import {Rule} from "../model";

export interface UIState {
    selectedRuleNumber: number | undefined;
}

interface SetSelectedRule {
    type: 'SetSelectedRule';
    rule: Rule | undefined;
}

type UIAction = SetSelectedRule;

function reducer(state: UIState, action: UIAction): UIState {
    switch (action.type) {
        case 'SetSelectedRule':
            const { rule } = action;
            return { ...state, selectedRuleNumber: rule?.ruleNumber };
    }
    return state;
}

const initialState: UIState = {
    selectedRuleNumber: undefined,
};

export const UIStateContext: React.Context<[UIState, Dispatch<UIAction>]> = React.createContext([initialState, (_: UIAction) => {}]);

export function ProvideUIState(props: any) {
    //@ts-ignore
    const [state, dispatch] = useReducer(reducer, initialState) as [UIState, Dispatch<UIAction>];

    return <UIStateContext.Provider value={[state, dispatch]}>
        {props.children}
    </UIStateContext.Provider>
}