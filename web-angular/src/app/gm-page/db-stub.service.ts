import {DBService} from "./db.service";
import {Injectable} from "@angular/core";

@Injectable()
export class DBServiceStub extends DBService {
    constructor() {
        super();
        this.game = {
            id: 1,
            title: 'テストゲーム',
            gameKey: 'abc123',
            masterKey: 'gm-xyz456',
        };

        this.players = [
            {id: 1, playerKey: 'aaaaaa', displayName: 'あずにゃん'},
            {id: 2, playerKey: 'bbbbbb', displayName: 'にこにー'},
            {id: 3, playerKey: 'cccccc', displayName: '香風智乃'},
        ];

        this.rules = [
            { id: 1, title: 'Test Rule', text: 'これはテストです', ruleNumber: 1, accessType: "ASSIGNED" },
            { id: 2, title: 'テスト２', text: '<span style="color:red">HTMLタグ</span>', ruleNumber: 2, accessType: "SHARED" },
        ];

        this.tokens = [
            { id: 1, title: 'トークン1', text: 'テストトークン', amount: 1 },
            { id: 2, title: 'トークン2', text: '<b>テストトークン</b>', amount: 2 },
        ];

        this.ruleAccessList = {
            1: [{ playerId: 1, accessType: 'ASSIGNED' }, { playerId: 2, accessType: 'SHARED' }],
            2: [{ playerId: 2, accessType: 'ASSIGNED' }, { playerId: 1, accessType: 'SHARED' }],
        };

        this.tokenAllocationMap = {
            1: [{playerId: 1, amount: 1}, {playerId: 2, amount: 2}],
            2: [{playerId: 3, amount: 3}],
        };
    }
}