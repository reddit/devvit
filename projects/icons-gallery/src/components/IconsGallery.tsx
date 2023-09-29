import { Devvit } from '@devvit/public-api';

import { Gallery } from '../gallery.js';
import { Columns } from './Columns.js';
import { CustomizeDialog } from './CustomizeDialog.js';
import { IconTile } from './IconTile.js';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import CustomPostComponent = Devvit.CustomPostComponent;

export const IconsGallery: CustomPostComponent = (context) => {
  const gallery = new Gallery(context);

  const icons = gallery.icons.map((icon) => <IconTile gallery={gallery} icon={icon} />);

  return (
    <blocks height={'tall'}>
      <zstack backgroundColor={'puregray-100'} grow>
        <vstack padding={'medium'} width={'100%'} height={'100%'}>
          <Header gallery={gallery} />
          <spacer size={'small'} />
          <hstack alignment={'center'}>
            <Columns count={2}>{icons}</Columns>
          </hstack>
          <spacer size={'small'} grow />
          <Footer gallery={gallery} />
        </vstack>
        <CustomizeDialog gallery={gallery} />
      </zstack>
    </blocks>
  );
};
