import { Devvit } from '@devvit/public-api';
import { Dialog } from './Dialog.js';
import { GallerySharedProps } from '../gallery.js';
import { Columns } from './Columns.js';
import BlockComponent = Devvit.BlockComponent;
import { RadioButton } from './RadioButton.js';

const BASIC_COLORS = [
  'coolgray-500',
  'puregray-500',
  'orangered-500',
  'red-500',
  'sakurapink-500',
  'berrypurple-500',
  'periwinkle-500',
  'alienblue-500',
  'lightblue-500',
  'mintgreen-500',
  'kiwigreen-500',
  'lime-500',
  'yellow-500',
  'yelloworange-500',
  'poopbrown-500',
  'neutral-background',
  'neutral-content-strong',
];

type ColorTileProps = {
  color: string;
  onPress: () => void;
};

const ColorTile = ({ color, onPress }: ColorTileProps): JSX.Element => {
  return (
    <hstack
      backgroundColor={color}
      padding={'medium'}
      border={'thin'}
      cornerRadius={'full'}
      onPress={onPress}
    />
  );
};

export const CustomizeDialog: BlockComponent<GallerySharedProps> = ({ gallery }) => {
  const updateSize = (size: string): void => {
    gallery.customizeSize = size;
  };

  return (
    <Dialog
      onClose={gallery.closeCustomizeDialog}
      visible={gallery.customizeDialogVisible}
      backgroundColor={'puregray-100'}
      modal
    >
      <vstack grow gap={'small'}>
        <text style={'heading'} color={'black'} selectable={false}>
          Customize Appearance
        </text>
        <spacer size={'medium'} />

        <hstack gap={'small'} alignment={'middle'}>
          <zstack alignment={'middle center'}>
            <text color={'black'} weight={'bold'} selectable={false}>
              Preview:
            </text>
            <icon name={'admin'} size={'large'} color={'transparent'} />
          </zstack>
          <hstack gap={'small'}>
            <icon
              name={'admin-outline'}
              size={gallery.customizeSize}
              color={gallery.customizeColor || 'black'}
            />
            <icon
              name={'admin-fill'}
              size={gallery.customizeSize}
              color={gallery.customizeColor || 'black'}
            />
          </hstack>
        </hstack>

        <text color={'black'} weight={'bold'} selectable={false}>
          Color:
        </text>
        <hstack alignment={'center middle'} gap={'small'}>
          <Columns count={6}>
            {BASIC_COLORS.map((name) => (
              <ColorTile color={name} onPress={gallery.setColor(name)} />
            ))}
            <zstack
              cornerRadius={'full'}
              border={'thin'}
              alignment={'middle center'}
              onPress={gallery.openCustomColorForm}
            >
              <hstack padding={'medium'} />
              <icon size={'small'} name={'appearance'} color={'black'} />
            </zstack>
          </Columns>
        </hstack>

        <text color={'black'} weight={'bold'} selectable={false}>
          Size:
        </text>
        <Columns count={2}>
          {['XSmall', 'Small', 'Medium', 'Large'].map((size) => (
            <RadioButton
              label={size}
              value={size.toLowerCase()}
              checked={gallery.customizeSize === size.toLowerCase()}
              onPress={updateSize}
              textColor={'black'}
              radioBorderColor={'black'}
              grow
            />
          ))}
        </Columns>

        <hstack alignment={'end'} gap={'small'}>
          <button appearance={'primary'} onPress={gallery.saveCustomizations}>
            Save
          </button>
        </hstack>
      </vstack>
    </Dialog>
  );
};
