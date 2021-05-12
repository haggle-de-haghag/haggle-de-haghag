import {Player} from "../model";
import {List, ListItem, ListItemIcon} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import {ListSubheader} from "@material-ui/core/index";

export interface Props {
    players: Player[];
}

export default function PlayerList(props: Props) {
    return <List subheader={<ListSubheader>プレイヤー</ListSubheader>}>
        {props.players.map((p) =>
            <ListItem key={p.id}>
                {p.displayName} ({p.playerKey})
            </ListItem>
        )}
    </List>;
}