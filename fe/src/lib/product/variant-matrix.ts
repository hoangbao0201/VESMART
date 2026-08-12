export type AxisValue = {
  clientId: string;
  valueId?: number;
  value: string;
};

export type AttributeAxis = {
  clientId: string;
  attributeId?: number;
  name: string;
  values: AxisValue[];
};

export type GeneratedCombination = {
  name: string;
  valueKeys: string[];
  values: AxisValue[];
};

function cartesian<T>(lists: T[][]): T[][] {
  if (lists.length === 0) return [[]];
  return lists.reduce<T[][]>(
    (acc, list) => acc.flatMap((prefix) => list.map((item) => [...prefix, item])),
    [[]],
  );
}

/** Build Color × Storage combinations from selected axes. */
export function generateVariantCombinations(axes: AttributeAxis[]): GeneratedCombination[] {
  const usable = axes
    .map((axis) => ({
      ...axis,
      values: axis.values.filter((v) => v.value.trim().length > 0),
    }))
    .filter((axis) => axis.name.trim() && axis.values.length > 0);

  if (usable.length === 0) return [];

  const combos = cartesian(usable.map((axis) => axis.values));
  return combos.map((values) => ({
    name: values.map((v) => v.value.trim()).join(" / "),
    valueKeys: values.map((v) => v.clientId),
    values,
  }));
}

export function newClientId(prefix = "c"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
