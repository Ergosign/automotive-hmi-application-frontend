// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { CSSObject } from "tss-react";

export const fonts = {
  // We explicitly avoid fallback fonts (such as 'monospace') here to work around a bug in
  // Chrome/Chromium on Windows that causes crashes when multiple Workers try to access fonts that
  // have not yet been loaded. There is a race against the internal DirectWrite font cache which
  // ends up crashing in DWriteFontFamily::GetFirstMatchingFont() or DWriteFont::Create().
  //
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1261577
  MONOSPACE: "'IBM Plex Mono'",
  SANS_SERIF: "'IBM Plex Sans'",
  // enable font features https://rsms.me/inter/lab
  SANS_SERIF_FEATURE_SETTINGS: "'cv08', 'cv10', 'tnum'",
  // contextual alternates create undesired changes in Chinese/Japanese
  SANS_SERIF_FEATURE_SETTINGS_CJK: "'tnum'",
};

export const serif_12px_400: CSSObject = {
  fontFamily: fonts.SANS_SERIF,
  fontSize: "0.75rem",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: 1.667, // 20px
};

export const serif_14px_400: CSSObject = {
  fontFamily: fonts.SANS_SERIF,
  fontSize: "0.875rem",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: 1.429, // 20px
};

export const serif_14px_500: CSSObject = {
  fontFamily: fonts.SANS_SERIF,
  fontSize: "0.875rem",
  fontStyle: "normal",
  fontWeight: "500",
  lineHeight: 1.429, // 20px
};

export const serif_16px_500: CSSObject = {
  fontFamily: fonts.SANS_SERIF,
  fontSize: "1rem",
  fontStyle: "normal",
  fontWeight: "500",
  lineHeight: 1.25, // 20px
};

export const serif_32px_500: CSSObject = {
  fontFamily: fonts.SANS_SERIF,
  fontSize: "2rem",
  fontStyle: "normal",
  fontWeight: "500",
  lineHeight: "normal",
};

export const mono_14px_500: CSSObject = {
  fontFamily: fonts.MONOSPACE,
  fontSize: "0.875rem",
  fontStyle: "normal",
  fontWeight: "500",
  lineHeight: 1.429, // 20px
};

export const mono_18px_500: CSSObject = {
  fontFamily: fonts.MONOSPACE,
  fontSize: "1.125rem",
  fontStyle: "normal",
  fontWeight: "500",
  lineHeight: 1.111, // 20px
};
