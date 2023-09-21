import nirtamir2 from "@nirtamir2/eslint-config";

// import { tsImport } from "tsx/esm/api";
// const local = await tsImport("./src/index.ts", import.meta.url).then(
//   (r) => r.default,
// );

export default nirtamir2(
  {
    type: "lib",
  },
  {
    ignores: ["vendor"],
  },
)
  // replace local config
  // .onResolved((configs) => {
  //   configs.forEach((config) => {
  //     if (config?.plugins?.antfu) config.plugins.antfu = local;
  //   });
  // });
