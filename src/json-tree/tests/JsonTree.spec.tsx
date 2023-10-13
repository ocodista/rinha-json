import { render, screen } from '@testing-library/react';
import { JsonTree } from '../JsonTree';
import { ArrayProp } from '../ArrayProp';
import { JsonType, JsonArrayType } from '../types';

const jsonAllTypes = {
  "Actors": [
    {
      "name": "Tom Cruise",
      "age": 56,
      "Born At": "Syracuse, NY",
      "Birthdate": "July 3, 1962",
      "photo": "https://jsonformatter.org/img/tom-cruise.jpg",
      "wife": null,
      "weight": 67.5,
      "hasChildren": true,
      "hasGreyHair": false,
      "children": [
        "Suri",
        "Isabella Jane",
        "Connor"
      ]
    },
    {
      "name": "Robert Downey Jr.",
      "age": 53,
      "Born At": "New York City, NY",
      "Birthdate": "April 4, 1965",
      "photo": "https://jsonformatter.org/img/Robert-Downey-Jr.jpg",
      "wife": "Susan Downey",
      "weight": 77.1,
      "hasChildren": true,
      "hasGreyHair": false,
      "children": [
        "Indio Falconer",
        "Avri Roel",
        "Exton Elias"
      ]
    }
  ]
}

const jsonObj = {
  "glossary": {
    "title": "example glossary",
    "GlossDiv": {
      "title": "S",
      "GlossList": {
        "GlossEntry": {
          "ID": "SGML",
          "SortAs": "SGML",
          "GlossTerm": "Standard Generalized Markup Language",
          "Acronym": "SGML",
          "Abbrev": "ISO 8879:1986",
          "GlossDef": {
            "para": "A meta-markup language, used to create markup languages such as DocBook.",
            "GlossSeeAlso": [
              "GML",
              "XML"
            ]
          },
          "GlossSee": "markup"
        }
      }
    },
    "GlossDiv2": {
      "title": "S",
      "GlossList": {
        "GlossEntry": {
          "ID": "SGML",
          "SortAs": "SGML",
          "GlossTerm": "Standard Generalized Markup Language",
          "Acronym": "SGML",
          "Abbrev": "ISO 8879:1986",
          "GlossDef": {
            "para": "A meta-markup language, used to create markup languages such as DocBook.",
            "GlossSeeAlso": [
              "GML",
              "XML"
            ]
          },
          "GlossSee": "markup language"
        }
      }
    }
  }
}

describe('Json Tree', () => {
  it('renders a string', async () => {
    render(<JsonTree json="abc" />)
    expect(await screen.findByText(`"abc"`)).toBeTruthy()
  })

  it('render a json object', () => {
    render(<JsonTree json={jsonObj} />)
  })

  it('render alltypes', async () => {
    render(<JsonTree json={jsonAllTypes as unknown as JsonType} />)
    const actors = await screen.findByLabelText("Actors")
    expect(actors).toBeTruthy()
    expect(actors.textContent).toBe("Actors: ")
  })
})

describe("ArrayProp", () => {
  it('renders a simple array', async () => {
    const simpleArr = [0, 1, 2]
    render(<ArrayProp arr={simpleArr} />)
    expect(await screen.findByText("[")).toBeTruthy()
    for (const value of simpleArr) {
      expect(await screen.findByText(value)).toBeTruthy()
    }
    expect(await screen.findByText("]")).toBeTruthy()
  })

  it('renders array of arrays', async () => {
    const arrArrays = [[], [], []]
    render(<ArrayProp arr={arrArrays as unknown as JsonArrayType} />)

    const indexes = screen.queryAllByLabelText('array-prop-index')
    expect(indexes.length).toBe(3)
    indexes.forEach((index, i) => expect(index.textContent).toBe(`${i}: `))
  })
})