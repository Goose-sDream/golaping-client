import styled from "styled-components";

interface LogoWithTextProps {
  text: string;
}

const LogoWithText = ({ text }: LogoWithTextProps) => {
  return (
    <svg width="500" height="751" viewBox="0 0 500 751" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_71_1848)">
        <path
          d="M549.002 568.075C549.002 773.239 538.147 869.131 208.04 869.131C-44.6008 869.131 -48.709 790.258 -48.709 585.094C-48.709 379.932 -48.7087 230.047 -48.709 196.596C281.398 196.596 549.002 362.913 549.002 568.075Z"
          fill="#8D64FD"
        />
        <path
          d="M110.58 268.909C110.592 277.926 111.739 287.577 115.848 295.435C116.761 297.181 117.492 298.912 118.711 300.886C120.002 302.764 120.944 304.165 122.512 305.915C124.08 307.665 125.657 308.991 126.99 310.148C128.295 311.282 130.662 312.509 132.285 313.134C134.421 313.958 136.928 315.005 139.317 315.939C141.314 316.751 143.82 317.229 146.048 317.536C147.891 317.79 151.335 317.785 153.056 317.837C155.093 317.778 157.722 317.516 159.524 317.11C164.555 315.978 169.178 314.247 173.971 311.54C176.374 310.027 178.25 308.271 179.815 306.791C181.275 305.41 183.254 303.704 183.942 302.984"
          stroke="black"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M214.156 315.885C215.37 324.799 217.791 334.151 222.901 341.234C224.037 342.808 224.991 344.397 226.459 346.144C227.987 347.786 229.104 349.014 230.888 350.482C232.671 351.951 234.407 352.998 235.88 353.919C237.322 354.822 239.826 355.64 241.514 355.987C243.737 356.444 246.354 357.06 248.841 357.585C250.924 358.053 253.465 358.108 255.709 358.039C257.566 357.982 260.971 357.4 262.679 357.165C264.685 356.766 267.25 356.068 268.978 355.365C273.801 353.404 278.142 350.92 282.521 347.443C284.694 345.545 286.316 343.494 287.665 341.769C288.925 340.16 290.654 338.143 291.239 337.315"
          stroke="black"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M201.816 258.803L204.123 256.191M204.123 256.191C204.123 256.191 208.884 251.429 211.374 247.983C220.782 234.966 220.931 208.723 220.931 208.723C220.931 208.723 185.901 185.348 174.132 163.281C161.853 140.254 159.767 123.504 163.915 98.0534C167.936 73.3897 174.912 58.6099 192.918 40.2453C206.981 25.9017 217.735 19.5279 237.08 12.4232C256.252 5.38246 268.565 4.69484 289.153 4.69484C309.741 4.69484 321.495 6.90564 341.225 12.4232C359.397 17.5049 370.253 20.3685 385.717 30.6621C404.787 43.356 414.178 53.8485 424.277 73.6315C434.306 93.2776 438.532 106.717 435.812 128.349C433.226 148.909 427.438 161.165 413.072 176.883C391.959 199.979 369.13 203.021 337.27 208.723C311.353 213.362 269.708 208.723 269.708 208.723C269.708 208.723 255.158 238.476 237.08 247.983C225.465 254.092 204.123 256.191 204.123 256.191Z"
          stroke="black"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <foreignObject x="200" y="60" width="200" height="200">
          <LogoText>{text}</LogoText>
        </foreignObject>
        <path
          d="M51.0564 275.822C51.0564 275.822 79.2823 324.3 105.634 347.711C128.908 368.388 144.018 379.426 173.416 389.671C205.803 400.959 226.559 397.865 260.857 397.887C299.454 397.912 359.155 387.617 359.155 387.617"
          stroke="black"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_71_1848">
          <rect width="500" height="750.587" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LogoWithText;

const LogoText = styled.p`
  font-size: 24px;
  color: black;
  text-align: center;
  z-index: 100;
  white-space: pre-line;
`;
