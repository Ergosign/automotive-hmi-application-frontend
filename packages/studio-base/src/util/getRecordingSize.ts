// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

export enum FileSizeUnit {
  GB = "GB",
  MB = "MB",
}

const unitConversionFactors: { [key in FileSizeUnit]: number } = {
  [FileSizeUnit.MB]: 1000 ** 2,
  [FileSizeUnit.GB]: 1000 ** 3,
};

export const convertRecordingSize = (size: string | bigint, unit: FileSizeUnit): string => {
  const bigIntSize = typeof size === "string" ? BigInt(size) : size;
  const conversionFactor = unitConversionFactors[unit];

  const numberSize = Number(bigIntSize);
  const convertedSize = numberSize / conversionFactor;

  if (unit === FileSizeUnit.MB) {
    return `${Math.floor(convertedSize)} ${unit}`;
  } else {
    return `${convertedSize.toFixed(2).replace(".", ",")} ${unit}`;
  }
};
