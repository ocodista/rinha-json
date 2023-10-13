import React, { ReactNode } from "react";

type ValueType = string | number | object | object[];
type Json = Record<string, ValueType>;

type JsonViewerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: Record<string, any>;
  depth?: number;
};

type JsonFileVisualizer = JsonViewerProps & {
  name: string;
};

export const JsonFileVisualizer = ({ name, ...other }: JsonFileVisualizer) => {
  return (
    <section className="w-[44%] p-3">
      <h1 className="text-2xl font-bold font-inter">{name}</h1>
      <JsonVisualizer {...other} />
    </section>
  );
};

const propClasses = "text-[#4E9590]";
const Span = ({ value, color }: { color: string; value: ValueType }) => (
  <span className={`text-xl font-[${color}]`} aria-label={value as string}>
    {value as ReactNode}
  </span>
);

const valueRender: Record<
  string,
  (value: ValueType, depth: number | undefined) => ReactNode
> = {
  ["string"]: (value: ValueType) => <Span color="inherit" value={value} />,
  ["number"]: (value: ValueType) => {
    return <Span color="#F2CAB8" value={value} />;
  },
  ["object"]: (value: ValueType, depth = 0) => (
    <JsonVisualizer json={value as Json} depth={depth} />
  ),
  ["boolean"]: (value: ValueType) => <span>{value as string}</span>,
};

interface ValueProps {
  value: ValueType;
  depth: number;
}
const Value = ({ value, depth }: ValueProps) => {
  if (!value) return undefined;
  if (value === 0) {
    console.log("t", typeof value);
    console.log({ value });
  }
  const func = valueRender[typeof value];
  return func(value, depth);
};

export const JsonVisualizer: React.FC<JsonViewerProps> = ({
  json,
  depth = 0,
}) => {
  const keys = Object.keys(json);
  if (Array.isArray(keys) && Array.isArray(json)) {
    return <h1>haha</h1>;
  }

  return (
    <ul className={depth > 0 ? "pl-4" : ""} tabIndex={0}>
      {keys.map((key) => {
        const value = json[key];
        return (
          <li key={key}>
            <span className={propClasses}>{key}: </span>
            <Value
              value={value}
              depth={typeof value !== "object" ? 0 : depth + 1}
            />
          </li>
        );
      })}
    </ul>
  );
};
