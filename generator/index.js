module.exports = (api, options, rootOptions, invoking) => {
  api.render("./template", { hasTS: api.hasPlugin("typescript") });

  // mochapack currently does not support webpack 5 yet
  require("@vue/cli-plugin-webpack-4/generator")(
    api,
    {},
    rootOptions,
    invoking
  );

  api.extendPackage({
    scripts: {
      "test:e2e": "vue-cli-service test:e2e",
      devDependencies: {
        "@vue/cli-plugin-webpack-4": require("../package.json").dependencies[
          "@vue/cli-plugin-webpack-4"
        ],
        chai: "^4.2.0",
      },
    },
  });

  if (api.hasPlugin("eslint")) {
    applyESLint(api);
  }

  if (api.hasPlugin("typescript")) {
    applyTS(api, invoking);
  }
};

const applyESLint = (module.exports.applyESLint = (api) => {
  api.extendPackage({
    eslintConfig: {
      overrides: [
        {
          files: ["**/tests/e2e/**/*.spec.{j,t}s?(x)"],
          env: {
            mocha: true,
          },
        },
      ],
    },
  });
});

const applyTS = (module.exports.applyTS = (api, invoking) => {
  api.extendPackage({
    devDependencies: {
      "@types/mocha": "^8.0.4",
      "@types/chai": "^4.2.11",
    },
  });
  // inject mocha/chai types to tsconfig.json
  if (invoking) {
    api.render((files) => {
      const tsconfig = files["tsconfig.json"];
      if (tsconfig) {
        const parsed = JSON.parse(tsconfig);
        const types = parsed.compilerOptions.types;
        if (types) {
          if (!types.includes("mocha")) {
            types.push("mocha");
          }
          if (!types.includes("chai")) {
            types.push("chai");
          }
        }
        files["tsconfig.json"] = JSON.stringify(parsed, null, 2) + "\n";
      }
    });
  }
});
