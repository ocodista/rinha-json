import { JsonTree } from "./json-tree/JsonTree";
import { JsonType } from "./json-tree/types";

type JsonViewerProps = {
  json: JsonType;
  depth?: number;
};

type JsonFileVisualizer = JsonViewerProps & {
  name: string;
};

export const JsonFileVisualizer = ({ name, ...other }: JsonFileVisualizer) => {
  return (
    <section className="w-[44%] p-3">
      <h1 className="text-2xl font-bold">{name}</h1>
      <JsonTree {...other} />
    </section>
  );
};
