import { Devvit } from '@devvit/public-api';
import type { Product } from '@devvit/shared-types/payments/Product.js';

/**
 * Props for the ProductButton component.
 * @name ProductButtonProps
 * @property product - The product to render.
 * @property onPress - A handler for when the button is pressed.
 * @property appearance - The appearance of the button. Defaults to 'compact'.
 * @property showIcon - Whether to show the product icon. Defaults to false.
 * @property buttonAppearance - The appearance of the button.
 * @property textColor - The color of the text.
 * @property ...rest - Additional props to pass to the parent Stack component.
 */
export type ProductButtonProps = Omit<Devvit.Blocks.StackProps, 'children' | 'onPress'> & {
  product: Product;
  onPress: (product: Product) => void;
  appearance?: 'compact' | 'detailed' | 'tile';
  showIcon?: boolean;
  buttonAppearance?: Devvit.Blocks.ButtonProps['appearance'];
  textColor?: Devvit.Blocks.TextProps['color'];
};

/**
 * A button that allows users to purchase a product.
 * @param {ProductButtonProps} props - The props for the ProductButton component.
 * @returns {JSX.Element} The ProductButton component.
 */
export function ProductButton({
  onPress,
  product,
  appearance = 'compact',
  showIcon = false,
  buttonAppearance = 'primary',
  textColor,
  ...rest
}: ProductButtonProps): JSX.Element {
  const isCompact = appearance === 'compact';
  const isTile = appearance === 'tile';
  const icon = product.images?.icon;
  const shouldShowIcon = showIcon && icon;

  const content = (
    <>
      {shouldShowIcon ? (
        <>
          <ProductIcon url={icon} size={isCompact ? 'small' : 'large'} />
          <spacer size="xsmall" />
        </>
      ) : null}
      {
        // Nudge the text away from the edge if there's no icon and it's not a tile.
        !isTile ? <spacer size="xsmall" /> : null
      }
      <vstack grow>
        <text weight="bold" color={textColor} grow={false}>
          {product.displayName}
        </text>

        {!isCompact ? (
          <text size="xsmall" color={textColor} wrap>
            {product.description}
          </text>
        ) : null}
      </vstack>
      <spacer size={isTile ? 'small' : 'medium'} />
      <button
        onPress={() => onPress(product)}
        appearance={buttonAppearance}
        icon="gold-fill"
        size="small"
      >
        Use {product.price}
      </button>
    </>
  );

  const parentStackProps: Devvit.Blocks.StackProps = {
    cornerRadius: isCompact ? 'full' : 'medium',
    gap: 'none',
    border: 'thin',
    padding: 'small',
    alignment: 'start middle',
    ...rest,
  };
  if (appearance === 'tile') {
    return <vstack {...parentStackProps}>{content}</vstack>;
  }
  return <hstack {...parentStackProps}>{content}</hstack>;
}

type ProductIconProps = {
  url: string;
  size: 'small' | 'large';
};

function ProductIcon({ url, size }: ProductIconProps): JSX.Element {
  const iconSize = size === 'small' ? '32px' : '50px';
  return (
    <vstack cornerRadius={size === 'small' ? 'full' : 'small'} height={iconSize} width={iconSize}>
      <image url={url} imageWidth={iconSize} imageHeight={iconSize} resizeMode="fill" />
    </vstack>
  );
}
