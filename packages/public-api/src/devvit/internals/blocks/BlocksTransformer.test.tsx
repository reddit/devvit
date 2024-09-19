/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

// This import is NOT unused, don't listen to your IDE
// noinspection ES6UnusedImports
import type { Block } from '@devvit/protos';
import {
  BlockActionType,
  BlockAvatarBackground,
  BlockAvatarFacing,
  BlockAvatarSize,
  BlockBorderWidth,
  BlockButtonAppearance,
  BlockButtonSize,
  BlockFullSnooSize,
  BlockGap,
  BlockHorizontalAlignment,
  BlockIconSize,
  BlockImageResizeMode,
  BlockPadding,
  BlockRadius,
  BlockRenderEventType,
  BlockRenderRequest,
  BlockSpacerSize,
  BlockStackDirection,
  BlockTextOutline,
  BlockTextSize,
  BlockTextStyle,
  BlockTextWeight,
  BlockType,
  BlockVerticalAlignment,
} from '@devvit/protos';
import { describe, expect, test } from 'vitest';

import { Devvit } from '../../Devvit.js';
import { BlocksReconciler } from './BlocksReconciler.js';
import { BlocksTransformer } from './BlocksTransformer.js';

const VALID_URL = 'https://i.redd.it/theImage';

const commonProps = {
  width: 25,
  height: 50,
  grow: true,
};

const commonPropsWithActions = {
  ...commonProps,
  onPress: () => {},
  'data-test': 'qux',
};

const commonPropsTests = (ui: Block): void => {
  expect(ui.sizes).toBeDefined();
  expect(ui.sizes?.width).toEqual({ value: { unit: 0, value: 25 } });
  expect(ui.sizes?.height).toEqual({ value: { unit: 0, value: 50 } });
  expect(ui.sizes?.grow).toBeTruthy();
};

const commonPropsTestsWithActions = (ui: Block): void => {
  commonPropsTests(ui);
  expect(ui.actions).toHaveLength(1);
  expect(ui.actions[0].type).toEqual(BlockActionType.ACTION_CLICK);
  expect(ui.actions[0].id.includes('onPress')).toBe(true);
  expect(ui.actions[0].data).not.toBeUndefined();
  expect(ui.actions[0].data).toHaveProperty('test', 'qux');
};

async function render(element: JSX.Element) {
  const reconciler = new BlocksReconciler(
    () => null,
    BlockRenderRequest.fromPartial({
      type: BlockRenderEventType.RENDER_INITIAL,
    }),
    {},
    {},
    undefined
  );

  return reconciler.renderElement({ debug: {} } as Devvit.Context, element);
}
describe('BlocksTransformer (JSX -> Block)', () => {
  describe('block ids', () => {
    test('block ids are passed through', async () => {
      const ui = await render(
        <blocks>
          <text id="a">foo</text>
          <text id="b" key="hello">
            bar
          </text>
        </blocks>
      );

      expect(ui.config?.rootConfig?.children).toHaveLength(2);
      expect(ui.config?.rootConfig?.children[0]?.id).toEqual('a');
      expect(ui.config?.rootConfig?.children[1]?.id).toEqual('b');
      expect(ui.config?.rootConfig?.children[1]?.key).toEqual('hello');
    });
  });

  describe('color', () => {
    const transformer = new BlocksTransformer();
    const redHex = transformer.blockColorToHex('red');
    const blueHex = transformer.blockColorToHex('blue');
    const whiteHex = transformer.blockColorToHex('white');
    const blackHex = transformer.blockColorToHex('black');

    test('getThemedColors uses single color for light and dark', () => {
      // Legacy/simplified behavior
      // <text color="red">
      const colors = transformer.getThemedColors('red');
      expect(colors?.light).toEqual(redHex);
      expect(colors?.dark).toEqual(redHex);
    });

    test('color falls back to red when cannot be parsed', () => {
      const color = transformer.blockColorToHex('gren');
      expect(color).toEqual(redHex);
    });

    test('getThemedColors supports all supported color formats', () => {
      const colorNames = transformer.getThemedColors('red blue');
      expect(colorNames?.light).toEqual(redHex);
      expect(colorNames?.dark).toEqual(blueHex);

      const hexColors = transformer.getThemedColors('#aaa #bbb');
      expect(hexColors?.light).toEqual('#aaa');
      expect(hexColors?.dark).toEqual('#bbb');

      const rgb1 = 'rgb(1, 2, 3)';
      const rgb2 = 'rgba(4, 5, 6, 0.5)';
      const rgbColors = transformer.getThemedColors(`${rgb1} ${rgb2}`);
      expect(rgbColors?.light).toEqual(transformer.blockColorToHex(rgb1));
      expect(rgbColors?.dark).toEqual(transformer.blockColorToHex(rgb2));

      const mixedRgb = 'rgb(7, 8, 9)';
      const mixedColors = transformer.getThemedColors(`red ${mixedRgb}`);
      expect(mixedColors?.light).toEqual(redHex);
      expect(mixedColors?.dark).toEqual(transformer.blockColorToHex(mixedRgb));
    });

    test('getThemedColors uses explicit light/dark colors first', () => {
      // Use red in light mode, use system color in dark mode
      // <text color="" lightColor="red">
      const lightOnly = transformer.getThemedColors(undefined, 'red');
      expect(lightOnly?.light).toEqual(redHex);
      expect(lightOnly?.dark).toBeUndefined();

      // Use system color in light mode, use blue in dark mode
      // <text color="" darkColor="blue">
      const darkOnly = transformer.getThemedColors(undefined, undefined, 'blue');
      expect(darkOnly?.light).toBeUndefined();
      expect(darkOnly?.dark).toEqual(blueHex);

      // Use red in light mode, fallback to white in dark mode
      // <text color="white" lightColor="red">
      const colorAndLight = transformer.getThemedColors('white', 'red');
      expect(colorAndLight?.light).toEqual(redHex);
      expect(colorAndLight?.dark).toEqual(whiteHex);

      // Fallback to white in light mode, use blue in dark mode
      // <text color="white" darkColor="blue">
      const colorAndDark = transformer.getThemedColors('white', undefined, 'blue');
      expect(colorAndDark?.light).toEqual(whiteHex);
      expect(colorAndDark?.dark).toEqual(blueHex);

      // Use red in light mode, use blue in dark mode (fallback ignored)
      // <text color="white" lightColor="red" darkColor="blue">
      const allSpecified = transformer.getThemedColors('white', 'red', 'blue');
      expect(allSpecified?.light).toEqual(redHex);
      expect(allSpecified?.dark).toEqual(blueHex);

      // Use red in light mode, fallback to black in dark mode
      // <text color="white black" lightColor="red">
      const allSpecifiedDarkFallback = transformer.getThemedColors('white black', 'red');
      expect(allSpecifiedDarkFallback?.light).toEqual(redHex);
      expect(allSpecifiedDarkFallback?.dark).toEqual(blackHex);
    });
  });

  describe('<blocks>', () => {
    test('outputs a valid object', async () => {
      const root = await render(<blocks />);
      expect(root.type).toEqual(BlockType.BLOCK_ROOT);
      expect(root.config?.rootConfig).not.toBeUndefined();
    });

    test('can have child elements', async () => {
      const root = await render(
        <blocks>
          <spacer />
        </blocks>
      );

      expect(root.config?.rootConfig?.children).toHaveLength(1);
    });

    test('inner text is discarded', async () => {
      const root = await render(
        <blocks>
          <spacer />
          hello
          <spacer />
        </blocks>
      );

      expect(root.config?.rootConfig?.children).toHaveLength(2);
    });
  });

  describe('fragments', () => {
    test('can wrap elements but is not part of the element tree', async () => {
      const ui = await render(
        <blocks>
          <>
            <spacer />
          </>
        </blocks>
      );

      expect(ui.config?.rootConfig?.children).toHaveLength(1);
      expect(ui.config?.rootConfig?.children[0]?.type).toEqual(BlockType.BLOCK_SPACER);
    });

    test('can wrap multiple elements', async () => {
      const ui = await render(
        <blocks>
          <>
            <spacer />
            <spacer />
          </>
        </blocks>
      );

      expect(ui.config?.rootConfig?.children).toHaveLength(2);
    });

    test('can wrap elements alongside other elements', async () => {
      const ui = await render(
        <blocks>
          <spacer />
          <>
            <spacer />
            <spacer />
          </>
        </blocks>
      );

      expect(ui.config?.rootConfig?.children).toHaveLength(3);
    });

    test('can be nested multiple layers', async () => {
      const ui = await render(
        <blocks>
          <spacer />
          <>
            <spacer />
            <spacer />
            <>
              <spacer />
              <spacer />
              <spacer />
              <>
                <spacer />
                <spacer />
                <spacer />
                <spacer />
              </>
              <spacer />
              <spacer />
              <spacer />
            </>
            <spacer />
            <spacer />
          </>
          <spacer />
        </blocks>
      );

      expect(ui.config?.rootConfig?.children).toHaveLength(16);
    });
  });

  describe('<text>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<text />);

      expect(ui.type).toEqual(BlockType.BLOCK_TEXT);
      expect(ui.config?.textConfig).not.toBeUndefined();
    });

    test('uses inner text for the text value', async () => {
      const ui = await render(<text>foo</text>);

      expect(ui.config?.textConfig?.text).toEqual('foo');
    });

    test('inner text can be a computed value', async () => {
      const val = 'foo';
      const ui = await render(<text>{val}</text>);

      expect(ui.config?.textConfig?.text).toEqual(val);
    });

    test('inner text can be a mixture of inner text and computed values', async () => {
      const val = 'foo';
      const ui = await render(<text>foo{val}bar</text>);

      expect(ui.config?.textConfig?.text).toEqual(`foo${val}bar`);
    });

    test('computed value can be an array', async () => {
      const values = [1, 2, 3, 4];
      const ui = await render(<text>{values.map((v) => v.toString())}</text>);

      expect(ui.config?.textConfig?.text).toEqual('1234');
    });

    test('computed value can be number', async () => {
      const val = 1;
      const ui = await render(<text>foo{val}bar</text>);

      expect(ui.config?.textConfig?.text).toEqual('foo1bar');
    });

    test('computed value can be zero', async () => {
      const val = 0;
      const ui = await render(<text>foo{val}bar</text>);
      expect(ui.config?.textConfig?.text).toEqual('foo0bar');
    });

    test('computed values can be false', async () => {
      const val = false;
      const ui = await render(<text>foo{val}bar</text>);
      expect(ui.config?.textConfig?.text).toEqual('foobar');
    });

    test('computed values can be undefined', async () => {
      const val = null;
      const ui = await render(<text>foo{val}bar</text>);
      expect(ui.config?.textConfig?.text).toEqual('foobar');
    });

    test('computed values can be NaN', async () => {
      const val = NaN;
      const ui = await render(<text>foo{val}bar</text>);
      expect(ui.config?.textConfig?.text).toEqual('fooNaNbar');
    });

    test('content can be a mixture of strings and arrays of strings', async () => {
      const ui = await render(<text>hello{['world', '!']}!</text>);

      expect(ui.config?.textConfig?.text).toEqual('helloworld!!');
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(
        <text
          size={'large'}
          weight={'bold'}
          color={'orangered'}
          alignment={'center middle'}
          outline={'thin'}
          style={'heading'}
          {...commonPropsWithActions}
        />
      );

      commonPropsTestsWithActions(ui);
      const text = ui.config!.textConfig!;
      expect(text.size).toEqual(BlockTextSize.TEXT_SIZE_LARGE);
      expect(text.weight).toEqual(BlockTextWeight.TEXT_WEIGHT_BOLD);
      expect(text.color).toEqual('#ff4500');
      expect(text.alignment).not.toBeUndefined();
      expect(text.alignment?.vertical).toEqual(BlockVerticalAlignment.ALIGN_MIDDLE);
      expect(text.alignment?.horizontal).toEqual(BlockHorizontalAlignment.ALIGN_CENTER);
      expect(text.outline).toEqual(BlockTextOutline.TEXT_OUTLINE_THIN);
      expect(text.style).toEqual(BlockTextStyle.TEXT_STYLE_HEADING);
    });
  });

  describe('<button>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<button />);

      expect(ui.type).toEqual(BlockType.BLOCK_BUTTON);
      expect(ui.config?.buttonConfig).not.toBeUndefined();
    });

    test('uses inner text for the label value', async () => {
      const ui = await render(<button>foo</button>);

      expect(ui.config?.buttonConfig?.text).toEqual('foo');
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(
        <button
          icon={'bot'}
          size={'large'}
          appearance={'success'}
          textColor={'orangered'}
          // backgroundColor={'orangered'}
          disabled={true}
          {...commonPropsWithActions}
        />
      );

      commonPropsTestsWithActions(ui);
      const button = ui.config!.buttonConfig!;
      expect(button.icon).toEqual('bot');
      expect(button.buttonSize).toEqual(BlockButtonSize.BUTTON_SIZE_LARGE);
      expect(button.buttonAppearance).toEqual(BlockButtonAppearance.BUTTON_APPEARANCE_SUCCESS);
      expect(button.textColor).toEqual('#ff4500');
      // expect(button.backgroundColor).toEqual('orangered');
      expect(button.disabled).toBeTruthy();
    });
  });

  describe('<image>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<image url={VALID_URL} imageWidth={0} imageHeight={0} />);

      expect(ui.type).toEqual(BlockType.BLOCK_IMAGE);
      expect(ui.config?.imageConfig).not.toBeUndefined();
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(
        <image
          url={'http:foo'}
          imageWidth={1}
          imageHeight={2}
          description={'bar'}
          resizeMode={'cover'}
          {...commonPropsWithActions}
        />
      );

      commonPropsTestsWithActions(ui);
      const image = ui.config!.imageConfig!;
      expect(image.url).toEqual('http:foo');
      expect(image.width).toEqual(1);
      expect(image.height).toEqual(2);
      expect(image.description).toEqual('bar');
      expect(image.resizeMode).toEqual(BlockImageResizeMode.IMAGE_RESIZE_COVER);
    });

    test('encodes special characters in the url to prevent attacks like DX-7176', async () => {
      const ui = await render(
        <image
          url={'http://redd.it\n.YOUR_DOMAIN_NAME.cloudns.biz/test.pn'}
          imageWidth={1}
          imageHeight={2}
          description={'bar'}
          resizeMode={'cover'}
          {...commonPropsWithActions}
        />
      );

      commonPropsTestsWithActions(ui);
      const image = ui.config!.imageConfig!;
      console.log(image.url);
      expect(image.url).toEqual('http://redd.it%0A.YOUR_DOMAIN_NAME.cloudns.biz/test.pn');
    });
  });

  describe('<spacer>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<spacer />);

      expect(ui.type === BlockType.BLOCK_SPACER);
      expect(ui.config?.spacerConfig).not.toBeUndefined();
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(<spacer size={'large'} {...commonProps} />);

      commonPropsTests(ui);
      const spacer = ui.config!.spacerConfig!;
      expect(spacer.size).toEqual(BlockSpacerSize.SPACER_LARGE);
    });
  });

  describe('<icon>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<icon name={'bot'} />);

      expect(ui.type === BlockType.BLOCK_ICON);
      expect(ui.config?.iconConfig).not.toBeUndefined();
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(
        <icon name={'bot'} size={'large'} color={'orangered'} {...commonPropsWithActions} />
      );

      commonPropsTestsWithActions(ui);
      const icon = ui.config!.iconConfig!;
      expect(icon.icon).toEqual('bot');
      expect(icon.size).toEqual(BlockIconSize.ICON_SIZE_LARGE);
      expect(icon.color).toEqual('#ff4500');
    });
  });

  describe('<avatar>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<avatar thingId={'t2_abc123'} />);

      expect(ui.type === BlockType.BLOCK_AVATAR);
      expect(ui.config?.avatarConfig).not.toBeUndefined();
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(
        <avatar
          thingId={'t2_abc123'}
          facing={'right'}
          size={'xxxlarge'}
          background={'dark'}
          {...commonPropsWithActions}
        />
      );

      commonPropsTestsWithActions(ui);
      const avatar = ui.config!.avatarConfig!;
      expect(avatar.thingId).toEqual('t2_abc123');
      expect(avatar.facing).toEqual(BlockAvatarFacing.AVATAR_FACING_RIGHT);
      expect(avatar.size).toEqual(BlockAvatarSize.AVATAR_SIZE_XXXLARGE);
      expect(avatar.background).toEqual(BlockAvatarBackground.AVATAR_BG_DARK);
    });
  });

  describe('<fullsnoo>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<fullsnoo userId={'t2_abc123'} />);

      expect(ui.type === BlockType.BLOCK_FULLSNOO);
      expect(ui.config?.fullsnooConfig).not.toBeUndefined();
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(
        <fullsnoo
          userId={'t2_abc123'}
          facing={'right'}
          size={'xxlarge'}
          {...commonPropsWithActions}
        />
      );

      commonPropsTestsWithActions(ui);
      const fullsnoo = ui.config!.fullsnooConfig!;
      expect(fullsnoo.userId).toEqual('t2_abc123');
      expect(fullsnoo.facing).toEqual(BlockAvatarFacing.AVATAR_FACING_RIGHT);
      expect(fullsnoo.size).toEqual(BlockFullSnooSize.FULLSNOO_XXLARGE);
    });
  });

  describe('<webview>', () => {
    test('outputs a valid object', async () => {
      const ui = await render(<webview url={VALID_URL} />);

      expect(ui.type === BlockType.BLOCK_WEBVIEW);
      expect(ui.config?.webviewConfig).not.toBeUndefined();
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(<webview url={'http:foo'} {...commonProps} />);

      commonPropsTests(ui);
      const webview = ui.config!.webviewConfig!;
      expect(webview.url).toEqual('http:foo');
    });
  });

  describe('<*stack>', () => {
    test('<vstack> outputs a valid object', async () => {
      const ui = await render(<vstack />);

      expect(ui.type).toEqual(BlockType.BLOCK_STACK);
      expect(ui.config?.stackConfig).not.toBeUndefined();
      expect(ui.config?.stackConfig?.direction).toEqual(BlockStackDirection.STACK_VERTICAL);
    });

    test('<hstack> outputs a valid object', async () => {
      const ui = await render(<hstack />);

      expect(ui.type).toEqual(BlockType.BLOCK_STACK);
      expect(ui.config?.stackConfig).not.toBeUndefined();
      expect(ui.config?.stackConfig?.direction).toEqual(BlockStackDirection.STACK_HORIZONTAL);
    });

    test('<zstack> outputs a valid object', async () => {
      const ui = await render(<zstack />);

      expect(ui.type).toEqual(BlockType.BLOCK_STACK);
      expect(ui.config?.stackConfig).not.toBeUndefined();
      expect(ui.config?.stackConfig?.direction).toEqual(BlockStackDirection.STACK_DEPTH);
    });

    test('can contain child elements', async () => {
      const ui = await render(
        <vstack>
          <spacer />
        </vstack>
      );

      expect(ui.config?.stackConfig?.children).toHaveLength(1);
    });

    test('all properties are properly copied to the object', async () => {
      const ui = await render(
        <vstack
          reverse={true}
          alignment={'end bottom'}
          padding={'large'}
          gap={'large'}
          border={'thick'}
          borderColor={'orangered'}
          cornerRadius={'full'}
          backgroundColor={'orangered'}
          {...commonPropsWithActions}
        />
      );

      commonPropsTestsWithActions(ui);
      const stack = ui.config!.stackConfig!;
      expect(stack.reverse).toBeTruthy();
      expect(stack.alignment).not.toBeUndefined();
      expect(stack.alignment?.vertical).toEqual(BlockVerticalAlignment.ALIGN_BOTTOM);
      expect(stack.alignment?.horizontal).toEqual(BlockHorizontalAlignment.ALIGN_END);
      expect(stack.padding).toEqual(BlockPadding.PADDING_LARGE);
      expect(stack.gap).toEqual(BlockGap.GAP_LARGE);
      expect(stack.border).not.toBeUndefined();
      expect(stack.border?.width).toEqual(BlockBorderWidth.BORDER_WIDTH_THICK);
      expect(stack.border?.color).toEqual('#ff4500');
      expect(stack.cornerRadius).toEqual(BlockRadius.RADIUS_FULL);
      expect(stack.backgroundColor).toEqual('#ff4500');
    });
  });

  describe('makeBlockBorder', () => {
    test('do not show border when no borderWidth and no borderColor.', async () => {
      const transformer = new BlocksTransformer();
      const stackBorder = transformer.makeBlockBorder(undefined, undefined, undefined, undefined);
      expect(stackBorder).toEqual(undefined);
    });

    test('show border with default color when only borderWidth set', async () => {
      const transformer = new BlocksTransformer();
      const stackBorder = transformer.makeBlockBorder('thin', undefined, undefined, undefined);
      expect(stackBorder).toEqual({
        width: BlockBorderWidth.BORDER_WIDTH_THIN,
        color: '#00000019',
        colors: {
          dark: '#FFFFFF19',
          light: '#00000019',
        },
      });
    });

    test('show default (thin) border when only borderColor set', async () => {
      const transformer = new BlocksTransformer();
      const stackBorder = transformer.makeBlockBorder(undefined, 'red', undefined, undefined);
      expect(stackBorder).toEqual({
        width: BlockBorderWidth.BORDER_WIDTH_THIN,
        color: '#ff0000',
        colors: {
          dark: '#ff0000',
          light: '#ff0000',
        },
      });
    });

    test('show border when color and width set', async () => {
      const transformer = new BlocksTransformer();
      const stackBorder = transformer.makeBlockBorder('thick', 'green', undefined, undefined);
      expect(stackBorder).toEqual({
        width: BlockBorderWidth.BORDER_WIDTH_THICK,
        color: '#008000',
        colors: {
          dark: '#008000',
          light: '#008000',
        },
      });
    });

    test('image width and height can be defined as a string', async () => {
      const img = await render(<image imageWidth={'10px'} imageHeight={'10px'} url={VALID_URL} />);
      expect(img?.config?.imageConfig?.width).toEqual(10);
      expect(img?.config?.imageConfig?.height).toEqual(10);
    });

    test('image width and height can be defined as a number', async () => {
      const img = await render(<image imageWidth={10} imageHeight={10} url={VALID_URL} />);
      expect(img?.config?.imageConfig?.width).toEqual(10);
      expect(img?.config?.imageConfig?.height).toEqual(10);
    });
  });
});
