import {Button, Grid, TextField} from "@material-ui/core/index";

interface Props {
    ruleTitle: string;
    ruleText: string;
    onRuleTitleChange: (value: string) => void;
    onRuleTextChange: (value: string) => void;
    onSaveButtonClick: () => void;
}

export default function RuleEditor(props: Props) {
    return <Grid container direction="column" spacing={1}>
        <Grid item>
            <TextField
                variant="filled"
                label="タイトル"
                fullWidth
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
                fullWidth
                value={props.ruleText}
                onChange={(e) => props.onRuleTextChange(e.target.value)}
            />
        </Grid>
        <Grid item xs={2}>
            <Button variant="contained" onClick={() => props.onSaveButtonClick()}>保存</Button>
        </Grid>
    </Grid>;
}