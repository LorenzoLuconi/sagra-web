import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from "@openapi-codegen/typescript";
import { defineConfig } from "@openapi-codegen/cli";
export default defineConfig({
  sagra: {
    from: {
      relativePath: "./sagra-api.json",
      source: "file",
    },
    outputDir: "src/api/sagra",
    to: async (context) => {
      const filenamePrefix = "sagra";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  }
});
