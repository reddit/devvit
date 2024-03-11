import { Devvit, svg } from '@devvit/public-api';

export const CloseCroppedIcon: Devvit.BlockComponent<{ onPress: () => void }> = (props) => {
  return (
    <image
      width="20px"
      height="32px"
      imageWidth="20px"
      imageHeight="32px"
      onPress={props.onPress}
      url={svg`<svg width="20" height="32" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="32" rx="16" fill="black" fill-opacity="0.8"/>
<g clip-path="url(#clip0_1449_12651)">
<path d="M22.7537 9.9536L22.0465 9.2464L16.0001 15.2928L9.95366 9.2464L9.24646 9.9536L15.2929 16L9.24646 22.0464L9.95366 22.7536L16.0001 16.7072L22.0465 22.7536L22.7537 22.0464L16.7073 16L22.7537 9.9536Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_1449_12651">
<rect width="16" height="16" fill="white" transform="translate(8 8)"/>
</clipPath>
</defs>
</svg>
`}
    />
  );
};
