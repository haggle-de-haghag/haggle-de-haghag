import { Saga } from "redux-saga";
import {call, spawn} from "redux-saga/effects";

export function* retryForever(saga: Saga) {
    yield spawn(function* () {
        while (true) {
            try {
                yield call(saga);
                break;
            } catch (e) {
                console.error('Swallowing error', e);
            }
        }
    });
}