interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
}

const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

// parseSemver 解析并校验形如 major.minor.patch 的版本号。
export function parseSemver(version: string): ParsedSemver {
  const match = SEMVER_PATTERN.exec(version.trim());
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }

  return {
    major: Number.parseInt(match[1] ?? "", 10),
    minor: Number.parseInt(match[2] ?? "", 10),
    patch: Number.parseInt(match[3] ?? "", 10),
  };
}

// compareSemver 比较两个语义化版本，返回 -1、0 或 1。
export function compareSemver(left: string, right: string): number {
  const parsedLeft = parseSemver(left);
  const parsedRight = parseSemver(right);

  if (parsedLeft.major !== parsedRight.major) {
    return parsedLeft.major < parsedRight.major ? -1 : 1;
  }

  if (parsedLeft.minor !== parsedRight.minor) {
    return parsedLeft.minor < parsedRight.minor ? -1 : 1;
  }

  if (parsedLeft.patch !== parsedRight.patch) {
    return parsedLeft.patch < parsedRight.patch ? -1 : 1;
  }

  return 0;
}

// isSemverGte 判断左侧版本是否大于等于右侧版本。
export function isSemverGte(left: string, right: string): boolean {
  return compareSemver(left, right) >= 0;
}
