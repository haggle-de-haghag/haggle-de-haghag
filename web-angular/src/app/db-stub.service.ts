import {DBService} from "./db.service";

export class DBServiceStub extends DBService {
    constructor() {
        super();

        this.gameTitle = 'テストゲーム';

        this.player = {
            id: 1,
            displayName: 'あずにゃん',
            playerKey: 'abc123',
        };

        this.players = [
            { id: 2, displayName: 'にこにー' },
            { id: 3, displayName: '香風智乃' },
        ];

        this.rules = [
            { id: 1, title: 'Test Rule', text: 'これはテストです', ruleNumber: 1, accessType: "ASSIGNED" },
            { id: 2, title: 'テスト２', text: '<span style="color:red">HTMLタグ</span>', ruleNumber: 2, accessType: "SHARED" },
        ];

        this.tokens = [
            { id: 1, title: 'トークン1', text: 'テストトークン', amount: 1 },
            { id: 2, title: 'トークン2', text: '<b>テストトークン</b>', amount: 2 },
        ];
    }
}