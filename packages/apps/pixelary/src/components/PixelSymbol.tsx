import { Devvit } from '@devvit/public-api';
import Glyphs from '../data/glyphs.json';
import Settings from '../settings.json';

export type SupportedGlyphs = keyof typeof Glyphs;

type Glyph = {
  path: string;
  width: number;
  height: number;
};

interface PixelSymbolProps {
  type: SupportedGlyphs;
  scale?: number;
  color?: string;
}

export function PixelSymbol(props: PixelSymbolProps): JSX.Element {
  const { type, scale = 2, color = Settings.theme.primary } = props;

  const glyph: Glyph = Glyphs[type];

  const height = glyph.height;
  const width = glyph.width;

  const scaledHeight: Devvit.Blocks.SizeString = `${height * scale}px`;
  const scaledWidth: Devvit.Blocks.SizeString = `${width * scale}px`;

  return (
    <image
      imageHeight={scaledHeight}
      imageWidth={scaledWidth}
      height={scaledHeight}
      width={scaledWidth}
      description={type}
      resizeMode="fill"
      url={`data:image/svg+xml,
        <svg
          width="${width}"
          height="${height}"
          viewBox="0 0 ${width} ${height}"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="${glyph.path}"
            fill="${color}"
            fill-rule="evenodd"
            clip-rule="evenodd"
          />
        </svg>
      `}
    />
  );
}
