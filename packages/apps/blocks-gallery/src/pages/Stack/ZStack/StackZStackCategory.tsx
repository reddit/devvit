import { Devvit } from '@devvit/public-api';
import { Columns } from '../../../components/Columns.js';
import { Tile } from '../../../components/Tile.js';
import { CategoryPage, CategoryPageState, CategoryProps } from '../../../components/CategoryPage.js';

export const StackZStackCategory = ({ state }: { state: CategoryPageState }): JSX.Element => {    
    const layerViaPadding = (reverse: boolean, includingPadding: boolean) => (
        <zstack reverse={reverse} padding={includingPadding ? 'small' : 'none'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
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

    const layerViaSpacer = (reverse: boolean, includingPadding: boolean) => (
        <zstack reverse={reverse} padding={includingPadding ? 'small' : 'none'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack height={'75px'} width={'75px'} darkBackgroundColor={'#0000FF'} lightBackgroundColor={'#0000FF'}>
            </zstack>
            <vstack>
                <spacer size='small'/>
                <hstack>
                    <spacer size='small'/>
                    <zstack height={'75px'} width={'75px'} darkBackgroundColor={'#FF0000'} lightBackgroundColor={'#FF0000'} padding={'small'}>
                    </zstack>
                </hstack>
            </vstack>
            <vstack>
                <spacer size='small'/>
                <spacer size='small'/>
                <hstack>
                    <spacer size='small'/>
                    <spacer size='small'/>
                    <zstack height={'75px'} width={'75px'} darkBackgroundColor={'#00FF00'} lightBackgroundColor={'#00FF00'} padding={'medium'}>
                    </zstack>
                </hstack>
            </vstack>
        </zstack>
    );

    const overflow = (includingPadding: boolean) => (
        <zstack padding={includingPadding ? 'small' : 'none'} height={'75px'} width={'75px'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack height={'100px'} width={'100px'} darkBackgroundColor={'#0000FF'} lightBackgroundColor={'#0000FF'} padding={'medium'}>
            </zstack>
        </zstack>
    );

    const growIgnored = (
        <zstack height={'75px'} width={'75px'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack grow={true} darkBackgroundColor={'#0000FF'} lightBackgroundColor={'#0000FF'} padding={'medium'}>
                <spacer size={'medium'} />
            </zstack>
        </zstack>
    );
    
    const instrinsic = (includingPadding: boolean) => (
        <zstack padding={includingPadding ? 'small' : 'none'} border={'thin'} darkBorderColor={'#FFFFFF'} lightBorderColor={'#000000'}>
            <zstack height={'75px'} width={'30px'} darkBackgroundColor={'#0000FF8C'} lightBackgroundColor={'#0000FF8C'} padding={'medium'}>
            </zstack>
            <zstack height={'30px'} width={'75px'} darkBackgroundColor={'#0000FF8C'} lightBackgroundColor={'#00FF008C'} padding={'medium'}>
            </zstack>
        </zstack>
    );

    const layerViaPaddingTiles: JSX.Element[] = [
        ["layer", layerViaPadding(false, true)],
        ["layer reverse", layerViaPadding(true, true)],
        ["layer (no padding)", layerViaPadding(false, false)],
        ["layer reverse (no padding)", layerViaPadding(true, false)]
    ].map(([label, element]) => (
        <Tile label={label as string} padding="small">
            {element}
        </Tile>
    ));

    const layerViaSpacerTiles: JSX.Element[] = [
        ["layer", layerViaSpacer(false, true)],
        ["layer reverse", layerViaSpacer(true, true)],
        ["layer (no padding)", layerViaSpacer(false, false)],
        ["layer reverse (no padding)", layerViaSpacer(true, false)]
    ].map(([label, element]) => (
        <Tile label={label as string} padding="small">
            {element}
        </Tile>
    ));

    const intrinsicTiles: JSX.Element[] = [["intrinsic", instrinsic(true)], ["intrsinsic (no padding)", instrinsic(false)]].map(([label, element]) => (
        <Tile label={label as string} padding="small">
            {element}
        </Tile>
    ));

    const overflowTiles: JSX.Element[] = [["overflow", overflow(true)], ["overflow (no padding)", overflow(false)]].map(([label, element]) => (
        <Tile label={label as string} padding="small">
            {element}
        </Tile>
    ));


    const growTiles: JSX.Element[] = [["grow ignored", growIgnored]].map(([label, element]) => (
        <Tile label={label as string} padding="small">
            {element}
        </Tile>
    ));

    const content = (element: JSX.Element) => (
        <Columns count={2}>
            {element}
        </Columns>
    );

    const subCategories: CategoryProps[] = [
        {label: 'Layer (padding)', category: 'zstack_layer_padding', content: content(layerViaPaddingTiles)},
        {label: 'Layer (spacer)', category: 'zstack_layer_spacer', content: content(layerViaSpacerTiles)},
        {label: 'Intrinsic Size', category: 'zstack_intrinsic', content: content(intrinsicTiles)},
        {label: 'Overflow', category: 'zstack_overflow', content: content(overflowTiles)},
        {label: 'Grow (ignored)', category: 'zstack_grow', content: content(growTiles)},
      ];

    return (
        <CategoryPage
          state={state}
          subCategoryPage
          categories={subCategories}
          activeCategory={state.subcategory}
          onCategoryChanged={state.setSubCategory}
        />
      );
};