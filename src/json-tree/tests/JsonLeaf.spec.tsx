import { JsonLeaf } from "../JsonLeaf";
import { render, screen } from "@testing-library/react";

describe("Json Leaf", () => {
  it("renders string", () => {
    render(<JsonLeaf json="abc" />);
    expect(screen.getByText(`"abc"`)).toBeTruthy();
  });

  it("renders integer number", () => {
    render(<JsonLeaf json={2} />);
    expect(screen.getByText(`2`)).toBeTruthy();
  });

  it("renders float number", () => {
    render(<JsonLeaf json={2.2} />);
    expect(screen.getByText(`2.2`)).toBeTruthy();
  });

  it("renders bool", () => {
    render(<JsonLeaf json={false} />);
    expect(screen.getByText(`false`)).toBeTruthy();
  });
});
