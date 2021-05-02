import {Grid, TextField} from "@material-ui/core/index";

interface Props {
    ruleTitle: string;
    ruleText: string;
    onRuleTitleChange: (value: string) => void;
    onRuleTextChange: (value: string) => void;
}

export default function RuleEditor(props: Props) {
    return <Grid direction="column">
        <Grid item>
            <TextField
                variant="filled"
                label="タイトル"
                value={props.ruleTitle}
                onChange={(e) => props.onRuleTitleChange(e.target.value)}
            />
        </Grid>
        <Grid item>
            <TextField
                variant="filled"
                label="ルール文章"
                multiline
                rows={5}
                value={props.ruleText}
                onChange={(e) => props.onRuleTextChange(e.target.value)}
            />
        </Grid>
    </Grid>;
}