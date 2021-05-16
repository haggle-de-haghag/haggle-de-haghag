import {createSlice, PayloadAction, Slice} from "@reduxjs/toolkit";
import {all, delay, put, takeEvery} from "redux-saga/effects";

export interface NotificationState {
    message?: string;
}

const initialState: NotificationState = {
};

export interface SetNotificationMessage {
    message?: string;
    expected?: string;
}

export function createNotificationState(name: string, showDurationMs: number = 3*1000) {
    const slice = createSlice({
        name: name,
        initialState: initialState,
        reducers: {
            showNotificationMessage: (state, action: PayloadAction<string>) => state,

            setNotificationMessage: (state, action: PayloadAction<SetNotificationMessage>) => {
                const payload = action.payload;
                if (payload.expected === undefined || payload.expected == state.message) {
                    state.message = payload.message;
                }
            },
        }
    });
    const actions = slice.actions;

    function* showNotificationSaga(action: ReturnType<typeof actions.showNotificationMessage>) {
        const message = action.payload;
        yield put(actions.setNotificationMessage({ message }));
        yield delay(showDurationMs);
        yield put(actions.setNotificationMessage({ message: undefined, expected: message }));
    }

    function* watcherSaga() {
        yield all([
            takeEvery(actions.showNotificationMessage, showNotificationSaga),
        ]);
    }

    return { slice, watcherSaga };
}
