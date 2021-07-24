import {useEffect, useRef} from "react";
import {makeStyles} from "@material-ui/core";

interface Props {
    html: string;
}

const useStyle = makeStyles((theme) => ({
    iframe: {
        border: 'none',
        width: '100%',
    }
}));

export function IFrameView(props: Props) {
    const ref = useRef(null as (HTMLIFrameElement | null));
    const styles = useStyle();

    const setHeight = () => {
        const current = ref.current;
        if (current) {
            const doc = current.contentDocument;
            if (doc) {
                current.height = `${doc.scrollingElement?.scrollHeight ?? 0}px`;
            }
        }
    };

    useEffect(() => {
        const current = ref.current;
        if (current) {
            const doc = current.contentDocument;
            if (doc) {
                current.height = '0';
                doc.open();
                doc.write(props.html.replaceAll("\n", "<br>"));
                doc.close();
                setHeight();
            }
        }
    }, [props.html, ref.current]);

    return <iframe ref={ref} className={styles.iframe} onLoad={setHeight}/>
}