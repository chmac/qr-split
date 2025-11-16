import encodeQR, { Bitmap } from "@paulmillr/qr";

function splitBooleanGrid(
  grid: boolean[][]
): [boolean[][], boolean[][], boolean[][]] {
  return grid.reduce<[boolean[][], boolean[][], boolean[][]]>(
    (acc, row) => {
      const [a, b, c] = acc;

      const [nrA, nrB, nrC] = row.reduce<[boolean[], boolean[], boolean[]]>(
        ([ra, rb, rc], val) => {
          if (!val) {
            return [
              [...ra, false],
              [...rb, false],
              [...rc, false],
            ];
          }

          const which = Math.floor(Math.random() * 3);

          return [
            [...ra, which === 0],
            [...rb, which === 1],
            [...rc, which === 2],
          ];
        },
        [[], [], []]
      );

      return [
        [...a, nrA],
        [...b, nrB],
        [...c, nrC],
      ];
    },
    [[], [], []]
  );
}

const text = "hello-foo-bar";
const array = encodeQR(text, "raw");

const arrays = splitBooleanGrid(array);

const transparentArrays = arrays.map((array) =>
  array.map((row) => row.map((cell) => (cell ? true : undefined)))
);

transparentArrays.forEach((array, outputIndex) => {
  const bitmap = new Bitmap(
    { height: array.length, width: array.length },
    array
  );

  const output = bitmap.toSVG();

  Deno.writeTextFileSync(`./output-${outputIndex}.svg`, output);
});
