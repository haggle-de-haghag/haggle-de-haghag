import {useEffect, useState} from "react";
import {Box, IconButton, makeStyles, TextField} from "@material-ui/core/index";
import EditIcon from '@material-ui/icons/Edit';

export interface Props {
    labelText: string;
    className?: string;
    onUpdate: (newLabel: string) => void;
}

const useStyles = makeStyles((theme) => ({
    typeface: {
        fontSize: theme.typography.fontSize,
    },
    labelComponent: {
        height: '100%',
        display: 'inline-block',
    },
}));

export function EditableLabel(props: Props) {
    const [editing, setEditing] = useState(false);
    const [inputText, setInputText] = useState(props.labelText);
    useEffect(() => setInputText(props.labelText), [props.labelText]);

    const classes = useStyles();
    const typefaceClass = props.className ?? classes.typeface;

    const renderBody = () => {
        const onFinishEditing = () => {
            props.onUpdate(inputText);
            setEditing(false);
        };

        const onEditClick = () => {
            setEditing(true);
        };

        if (editing) {
            return <TextField
                InputProps={{className: typefaceClass}}
                autoFocus={true}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onBlur={onFinishEditing}
                onKeyPress={(e) => e.key == 'Enter' && onFinishEditing()}
            />
        } else {
            return <Box className={`${typefaceClass} ${classes.labelComponent}`}>
                {inputText}
                <IconButton onClick={() => onEditClick()}><EditIcon /></IconButton>
            </Box>;
        }
    };

    return <Box display="inline-flex">{renderBody()}</Box>;
}