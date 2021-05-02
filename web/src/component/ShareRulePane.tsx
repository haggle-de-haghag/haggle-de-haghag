import {ForeignPlayer} from "../model";
import {List, ListItem, ListItemIcon} from "@material-ui/core/index";
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

interface Props {
    players: ForeignPlayer[];
    onShareButtonClick: (player: ForeignPlayer) => void;
}

export default function ShareRulePane(props: Props) {
    const { players, onShareButtonClick } = props;

    return <List>
        {players.map((p) =>
            <ListItem key={p.id} button onClick={() => onShareButtonClick(p)}>
                <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
                {p.displayName}に見せる
            </ListItem>
        )}
    </List>
}