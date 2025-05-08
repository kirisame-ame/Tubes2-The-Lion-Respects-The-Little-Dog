package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type Element struct {
    Name    string     `json:"Element"`
    Recipes [][]string `json:"Recipes"`
}

type RecipeNode struct {
    Ingredients [2]string
    Product     string
    Children    []*RecipeNode
}

func loadEntries(path string) ([]Element, error) {
    raw, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    var groups []struct {
        Tier  string    `json:"Tier"`
        Items []Element `json:"Items"`
    }
    if err := json.Unmarshal(raw, &groups); err != nil {
        return nil, err
    }
    var all []Element
    for _, g := range groups {
        all = append(all, g.Items...)
    }
    return all, nil
}

func buildIndex(entries []Element) map[string]Element {
    idx := make(map[string]Element, len(entries))
    for _, e := range entries {
        idx[strings.ToLower(e.Name)] = e
    }
    return idx
}

func buildRecipeTree(product string, idx map[string]Element, visited map[string]bool) *RecipeNode {
    key := strings.ToLower(product)
    if visited[key] {
        return nil
    }
    visited[key] = true
    defer delete(visited, key)

    e, ok := idx[key]
    if !ok {
        return nil
    }
    root := &RecipeNode{Product: product}
    for _, rec := range e.Recipes {
        ing1, ing2 := rec[0], rec[1]
        combo := &RecipeNode{
            Ingredients: [2]string{ing1, ing2},
            Product:     product,
        }
        if sub := buildRecipeTree(ing1, idx, visited); sub != nil {
            combo.Children = append(combo.Children, sub)
        }
        if sub := buildRecipeTree(ing2, idx, visited); sub != nil {
            combo.Children = append(combo.Children, sub)
        }
        root.Children = append(root.Children, combo)
    }
    return root
}


func printRecipeTree(n *RecipeNode, indent string) {
    if n == nil {
        return
    }
    if n.Ingredients != [2]string{} {
        fmt.Printf("%s[%s + %s] → %s\n",
            indent, n.Ingredients[0], n.Ingredients[1], n.Product)
    } else {
        fmt.Printf("%s%s\n", indent, n.Product)
    }
    for _, c := range n.Children {
        printRecipeTree(c, indent+"  ")
    }
}

// func main() {
//     entries, err := loadEntries("data/smallds.json")
//     if err != nil {
//         fmt.Println("Error loading entries:", err)
//         return
//     }
//     idx := buildIndex(entries)
// 	visited := make(map[string]bool)

//     target := "dust"
//     tree := buildRecipeTree(target, idx,visited)
//     if tree == nil {
//         fmt.Printf("No recipes for %q\n", target)
//         return
//     }
//     printRecipeTree(tree, "-")
// }
