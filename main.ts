import encodeQR, { Bitmap } from "@paulmillr/qr";

const usage = `deno --allow-write=output run main.ts 3 "Some string to encode"`;

function splitBooleanGridN(grid: boolean[][], pieces: number): boolean[][][] {
  const initial: boolean[][][] = Array.from(
    { length: pieces },
    () => [] as boolean[][]
  );

  return grid.reduce<boolean[][][]>((acc, row) => {
    const newRows: boolean[][] = Array.from(
      { length: pieces },
      () => [] as boolean[]
    );

    row.reduce<boolean[][]>((rowsAcc, val) => {
      if (!val) {
        for (let i = 0; i < pieces; i++) {
          rowsAcc[i].push(false);
        }
        return rowsAcc;
      }

      const which = Math.floor(Math.random() * pieces);
      for (let i = 0; i < pieces; i++) {
        rowsAcc[i].push(i === which);
      }
      return rowsAcc;
    }, newRows);

    return acc.map((g, i) => [...g, newRows[i]]);
  }, initial);
}

const [outputPieceCountArgument, text] = Deno.args;

if (typeof outputPieceCountArgument === "undefined") {
  console.error("ERROR: Number of pieces not specified");
  console.log(usage);
  Deno.exit();
}

const outputPieceCount = parseInt(outputPieceCountArgument);

if (!(outputPieceCount > 0)) {
  console.error("ERROR: Invalid number of pieces");
  console.log(usage);
  Deno.exit();
}

if (typeof text !== "string" || text.length === 0) {
  console.error("ERROR: Invalid input string provided");
  console.log(usage);
  Deno.exit();
}

const array = encodeQR(text, "raw");

const arrays = splitBooleanGridN(array, 3);

const transparentArrays = arrays.map((array) =>
  array.map((row) => row.map((cell) => (cell ? true : undefined)))
);

transparentArrays.forEach((array, outputIndex) => {
  const bitmap = new Bitmap(
    { height: array.length, width: array.length },
    array
  );

  const output = bitmap.toSVG();

  Deno.writeTextFileSync(`./output/output-${outputIndex}.svg`, output);
});
