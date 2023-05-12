import { roundTo } from "@util/misc";

export default function roundAmounts(values, decimals) {
  return values.map((value) => ({
    ...value,
    amount: roundTo(value.amount, decimals),
  }));
}
