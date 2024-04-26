import { Devvit } from '@devvit/public-api';
import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const StackZStackCategory = (): JSX.Element => {
    const layer = (reverse: boolean) => (
        <zstack reverse={reverse} padding={'small'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack height={'75px'} width={'75px'} darkBackgroundColor={'#0000FF'} lightBackgroundColor={'#0000FF'}>
            </zstack>
            <zstack padding={'small'}>
                <zstack height={'75px'} width={'75px'} darkBackgroundColor={'#FF0000'} lightBackgroundColor={'#FF0000'} padding={'small'}>
                </zstack>
            </zstack>
            <zstack padding={'medium'}>
                <zstack height={'75px'} width={'75px'} darkBackgroundColor={'#00FF00'} lightBackgroundColor={'#00FF00'} padding={'medium'}>
                </zstack>
            </zstack>
        </zstack>
    );

    const overflow = (includingPadding: boolean) => (
        <zstack padding={includingPadding ? 'small' : 'none'} height={'75px'} width={'75px'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack height={'100px'} width={'100px'} darkBackgroundColor={'#0000FF'} lightBackgroundColor={'#0000FF'} padding={'medium'}>
            </zstack>
        </zstack>
    )

    const growIgnored = (
        <zstack height={'75px'} width={'75px'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack grow={true} darkBackgroundColor={'#0000FF'} lightBackgroundColor={'#0000FF'} padding={'medium'}>
                <spacer size={'medium'} />
            </zstack>
        </zstack>
    )
    
    const instrinsic = (includingPadding: boolean) => (
        <zstack padding={includingPadding ? 'small' : 'none'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack height={'75px'} width={'30px'} darkBackgroundColor={'#0000FF8C'} lightBackgroundColor={'#0000FF8C'} padding={'medium'}>
            </zstack>
            <zstack height={'30px'} width={'75px'} darkBackgroundColor={'#0000FF8C'} lightBackgroundColor={'#00FF008C'} padding={'medium'}>
            </zstack>
        </zstack>
    )

    const options: [string, JSX.Element][] = [];
    options.push(["layer", layer(false)])
    options.push(["reverse", layer(true)])
    options.push(["overflow", overflow(true)])
    options.push(["overflow (no padding)", overflow(false)])
    options.push(["grow ignored", growIgnored])
    options.push(["intrinsic", instrinsic(true)])
    options.push(["instrinsic (no padding)", instrinsic(false)])

    const content = options.map(([label, element]) => (
    <Tile label={label} padding="small">
        {element}
    </Tile>
    ));

    return (
    <vstack grow>
        <Columns count={2}>{content}</Columns>
    </vstack>
    );
};