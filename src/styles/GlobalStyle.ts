// src/styles/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* 모든 요소의 마진, 패딩 제거 */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 블록 요소/인라인 요소 구분 없이 모두 block 처리 */
  body, h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, figcaption, blockquote, dl, dd {
    margin: 0;
    padding: 0;
    font-weight: normal;
    font-size: 100%;
  }

  /* 리스트 스타일 제거 */
  ul, ol {
    list-style: none;
  }

  /* 링크 밑줄, 색상 제거 */
  a {
    text-decoration: none;
    color: inherit;
  }

  /* 버튼, 인풋 테두리 및 배경 제거 */
  button, input, textarea {
    border: none;
    background: none;
    font: inherit;
  }

  /* 기본 폰트 및 색상 설정 */
  body {
    font-family: 'Noto Sans KR', sans-serif;
    background-color: #fff;
    color: #000;
    line-height: 1.5;
  }
`;

export default GlobalStyle;
